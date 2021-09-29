import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import { defaultMemoize } from 'reselect';

import DeleteSolutionButtonContainer from '../../containers/DeleteSolutionButtonContainer/DeleteSolutionButtonContainer';
import AcceptSolutionContainer from '../../containers/AcceptSolutionContainer';
import ReviewSolutionContainer from '../../containers/ReviewSolutionContainer';

import Page from '../../components/layout/Page';
import { GroupNavigation } from '../../components/layout/Navigation';
import { AssignmentIcon, SearchIcon, UserIcon } from '../../components/icons';
import SolutionTableRowIcons from '../../components/Assignments/SolutionsTable/SolutionTableRowIcons';
import Points from '../../components/Assignments/SolutionsTable/Points';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import OnOffCheckbox from '../../components/forms/OnOffCheckbox';
import Box from '../../components/widgets/Box';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import DateTime from '../../components/widgets/DateTime';
import SortableTable, { SortableTableColumnDescriptor } from '../../components/widgets/SortableTable';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import EnvironmentsListItem from '../../components/helpers/EnvironmentsList/EnvironmentsListItem';
import GroupArchivedWarning from '../../components/Groups/GroupArchivedWarning/GroupArchivedWarning';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { fetchGroupStudentsSolutions } from '../../redux/modules/solutions';
import { groupSelector, groupsAssignmentsSelector, groupDataAccessorSelector } from '../../redux/selectors/groups';
import {
  assignmentEnvironmentsSelector,
  getUserSolutions,
  getUserSolutionsSortedData,
} from '../../redux/selectors/assignments';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchManyGroupStudentsSolutionsStatus } from '../../redux/selectors/solutions';
import { runtimeEnvironmentSelector, fetchRuntimeEnvironmentsStatus } from '../../redux/selectors/runtimeEnvironments';
import { getJsData } from '../../redux/helpers/resourceManager';
import { compareAssignmentsReverted } from '../../components/helpers/assignments';

import { storageGetItem, storageSetItem } from '../../helpers/localStorage';
import { getLocalizedName } from '../../helpers/localizedData';
import withLinks from '../../helpers/withLinks';
import { safeGet, identity, hasPermissions, hasOneOfPermissions } from '../../helpers/common';

/**
 * Sorts all assignments and create a numerical index, so the solutions can be sorted faster
 * (without comparing assignment names repeatedly).
 * @param {Array} assignments
 * @param {string} locale
 * @returns {Function} assignments comparator
 */
const prepareCachedAssignmentsComparator = (assignments, locale) => {
  const names = assignments.map(assignment => ({ name: getLocalizedName(assignment, locale), id: assignment.id }));
  names.sort((a, b) => a.name.localeCompare(b.name, locale));
  const index = Object.fromEntries(names.map(({ id }, idx) => [id, idx + 1]));
  return (a, b) => (index[a.id] && index[b.id] ? index[a.id] - index[b.id] : 0);
};

const prepareTableColumnDescriptors = defaultMemoize((assignments, groupId, locale, links) => {
  const { SOLUTION_DETAIL_URI_FACTORY, ASSIGNMENT_STATS_URI_FACTORY } = links;

  const assignmentsComparator = prepareCachedAssignmentsComparator(assignments, locale);

  const columns = [
    new SortableTableColumnDescriptor('icon', '', {
      className: 'text-nowrap',
      cellRenderer: info => (
        <SolutionTableRowIcons
          id={info.id}
          accepted={info.accepted}
          reviewed={info.reviewed}
          isBestSolution={info.isBestSolution}
          status={info.lastSubmission ? info.lastSubmission.evaluationStatus : null}
          lastSubmission={info.lastSubmission}
          commentsStats={info.commentsStats}
        />
      ),
    }),

    new SortableTableColumnDescriptor(
      'date',
      <FormattedMessage id="app.solutionsTable.submissionDate" defaultMessage="Date of submission" />,
      {
        className: 'text-left',
        comparator: ({ date: d1 }, { date: d2 }) => d2 - d1, // dates are implicitly in reversed order
        cellRenderer: (createdAt, idx) =>
          createdAt && <DateTime unixts={createdAt} showOverlay overlayTooltipId={`datetime-${idx}`} />,
      }
    ),

    new SortableTableColumnDescriptor(
      'assignment',
      <FormattedMessage id="app.solutionsTable.assignment" defaultMessage="Assignment" />,
      {
        className: 'text-left',
        comparator: ({ assignment: a1, date: d1 }, { assignment: a2, date: d2 }) =>
          assignmentsComparator(a1, a2) || d2 - d1, // dates are implicitly in reversed order
        cellRenderer: assignment =>
          assignment && (
            <small className="text-nowrap">
              <Link to={ASSIGNMENT_STATS_URI_FACTORY(assignment.id)}>
                <LocalizedExerciseName entity={{ name: '??', localizedTexts: assignment.localizedTexts }} />
              </Link>
            </small>
          ),
      }
    ),

    new SortableTableColumnDescriptor(
      'validity',
      <FormattedMessage id="app.solutionsTable.solutionValidity" defaultMessage="Validity" />,
      {
        className: 'text-center',
        headerClassName: 'text-nowrap',
        comparator: ({ validity: v1, date: d1 }, { validity: v2, date: d2 }) =>
          (v2 === null ? -1 : v2) - (v1 === null ? -1 : v1) || d2 - d1, // values are implicitly form the best to the worst
        cellRenderer: validity =>
          validity !== null ? (
            <strong className="text-success">
              <FormattedNumber style="percent" value={validity} />
            </strong>
          ) : (
            <span className="text-danger">-</span>
          ),
      }
    ),

    new SortableTableColumnDescriptor(
      'points',
      <FormattedMessage id="app.solutionsTable.receivedPoints" defaultMessage="Points" />,
      {
        className: 'text-center',
        headerClassName: 'text-nowrap',
        comparator: ({ points: p1, date: d1 }, { points: p2, date: d2 }) => {
          const points1 = p1.actualPoints === null ? 0 : p1.bonusPoints + p1.actualPoints;
          const points2 = p2.actualPoints === null ? 0 : p2.bonusPoints + p2.actualPoints;
          return points2 - points1 || d2 - d1;
        },
        cellRenderer: points =>
          points.actualPoints !== null ? (
            <strong className="text-success">
              <Points points={points.actualPoints} bonusPoints={points.bonusPoints} maxPoints={points.maxPoints} />
            </strong>
          ) : (
            <span className="text-danger">-</span>
          ),
      }
    ),

    new SortableTableColumnDescriptor(
      'runtimeEnvironment',
      <FormattedMessage id="app.solutionsTable.environment" defaultMessage="Target language" />,
      {
        className: 'text-center',
        cellRenderer: runtimeEnvironment =>
          runtimeEnvironment ? <EnvironmentsListItem runtimeEnvironment={runtimeEnvironment} longNames /> : '-',
      }
    ),

    new SortableTableColumnDescriptor('note', <FormattedMessage id="app.solutionsTable.note" defaultMessage="Note" />, {
      className: 'small full-width',
      headerClassName: 'text-left',
    }),

    new SortableTableColumnDescriptor('actionButtons', '', {
      className: 'text-right valign-middle text-nowrap',
      cellRenderer: solution => (
        <TheButtonGroup>
          {solution.permissionHints && solution.permissionHints.viewDetail && (
            <Link to={SOLUTION_DETAIL_URI_FACTORY(solution.assignmentId, solution.id)}>
              <Button size="xs" variant="secondary">
                <SearchIcon gapRight />
                <FormattedMessage id="generic.detail" defaultMessage="Detail" />
              </Button>
            </Link>
          )}
          {solution.permissionHints && solution.permissionHints.setFlag && (
            <>
              <AcceptSolutionContainer id={solution.id} locale={locale} shortLabel size="xs" />
              <ReviewSolutionContainer id={solution.id} locale={locale} size="xs" />
            </>
          )}
          {solution.permissionHints && solution.permissionHints.delete && (
            <DeleteSolutionButtonContainer id={solution.id} groupId={groupId} size="xs" />
          )}
        </TheButtonGroup>
      ),
    }),
  ];

  return columns;
});

const prepareTableData = defaultMemoize(
  (assignments, getAssignmentSolutions, getRuntime, onlyBestSolutionsCheckbox) => {
    const res = [];
    assignments.forEach(assignment =>
      getAssignmentSolutions(assignment.id)
        .toArray()
        .map(getJsData)
        .filter(onlyBestSolutionsCheckbox ? solution => solution && solution.isBestSolution : identity)
        .forEach(
          ({
            id,
            lastSubmission,
            assignmentId,
            createdAt,
            runtimeEnvironmentId,
            note,
            maxPoints,
            bonusPoints,
            actualPoints,
            accepted,
            reviewed,
            isBestSolution,
            commentsStats,
            permissionHints,
          }) => {
            const statusEvaluated =
              lastSubmission &&
              (lastSubmission.evaluationStatus === 'done' || lastSubmission.evaluationStatus === 'failed');
            const rte = getRuntime(runtimeEnvironmentId);

            res.push({
              icon: { id, commentsStats, lastSubmission, accepted, reviewed, isBestSolution },
              assignment,
              date: createdAt,
              validity: statusEvaluated ? safeGet(lastSubmission, ['evaluation', 'score']) : null,
              points: statusEvaluated ? { maxPoints, bonusPoints, actualPoints } : { actualPoints: null },
              runtimeEnvironment: rte && getJsData(rte),
              note,
              actionButtons: { id, assignmentId, permissionHints },
            });
          }
        )
    );

    return res;
  }
);

const localStorageStateKey = 'GroupUserSolutions.state';

class GroupUserSolutions extends Component {
  static loadAsync = ({ groupId, userId }, dispatch) =>
    Promise.all([
      dispatch(fetchUserIfNeeded(userId)),
      dispatch(fetchGroupIfNeeded(groupId)).then(({ value: group }) =>
        Promise.all(
          hasPermissions(group, 'viewAssignments')
            ? [dispatch(fetchAssignmentsForGroup(groupId)), dispatch(fetchGroupStudentsSolutions(groupId, userId))]
            : []
        )
      ),
      dispatch(fetchRuntimeEnvironments()),
    ]);

  state = { groupByAssignmentsCheckbox: true, onlyBestSolutionsCheckbox: false };

  checkboxClickHandler = ev => {
    this.setState({ [ev.target.name]: !this.state[ev.target.name] }, () => {
      // callback after the state is updated
      storageSetItem(localStorageStateKey, {
        groupByAssignmentsCheckbox: this.state.groupByAssignmentsCheckbox,
        onlyBestSolutionsCheckbox: this.state.onlyBestSolutionsCheckbox,
      });
    });
  };

  componentDidMount = () => {
    this.props.loadAsync();
    this.setState(storageGetItem(localStorageStateKey, null));
  };

  componentDidUpdate(prevProps) {
    if (this.props.groupId !== prevProps.groupId || this.props.userId !== prevProps.userId) {
      this.props.loadAsync();
    }
  }

  // Re-format the data, so they can be rendered by the SortableTable ...
  render() {
    const {
      groupId,
      userId,
      group,
      groupsAccessor,
      assignments,
      assignmentEnvironmentsSelector,
      getAssignmentSolutions,
      getAssignmentSolutionsSorted,
      getRuntime,
      fetchSolutionsStatus,
      fetchRuntimesStatus,
      intl: { locale },
      links,
    } = this.props;

    return (
      <Page
        resource={group}
        icon={<UserIcon />}
        title={
          <FormattedMessage id="app.groupUserSolutions.title" defaultMessage="All Submissions of Selected User" />
        }>
        {group => (
          <div>
            <GroupNavigation
              groupId={groupId}
              userId={userId}
              canEdit={hasOneOfPermissions(group, 'update', 'archive', 'remove', 'relocate')}
              canViewDetail={hasPermissions(group, 'viewDetail')}
            />

            <GroupArchivedWarning
              {...group}
              groupsDataAccessor={groupsAccessor}
              linkFactory={links.GROUP_EDIT_URI_FACTORY}
            />

            <div className="text-right text-nowrap py-2">
              <OnOffCheckbox
                className="text-left mr-3"
                checked={this.state.groupByAssignmentsCheckbox}
                disabled={this.state.onlyBestSolutionsCheckbox}
                name="groupByAssignmentsCheckbox"
                onChange={this.checkboxClickHandler}>
                <FormattedMessage
                  id="app.groupUserSolutions.groupByAssignmentsCheckbox"
                  defaultMessage="Group by assignments"
                />
              </OnOffCheckbox>
              <OnOffCheckbox
                className="text-left mr-3"
                checked={this.state.onlyBestSolutionsCheckbox}
                name="onlyBestSolutionsCheckbox"
                onChange={this.checkboxClickHandler}>
                <FormattedMessage
                  id="app.groupUserSolutions.onlyBestSolutionsCheckbox"
                  defaultMessage="Best solutions only"
                />
              </OnOffCheckbox>
            </div>

            <ResourceRenderer resource={assignments} returnAsArray>
              {assignments => (
                <FetchManyResourceRenderer fetchManyStatus={fetchSolutionsStatus}>
                  {() => (
                    <FetchManyResourceRenderer fetchManyStatus={fetchRuntimesStatus}>
                      {() =>
                        this.state.groupByAssignmentsCheckbox && !this.state.onlyBestSolutionsCheckbox ? (
                          <div>
                            {assignments.sort(compareAssignmentsReverted).map(assignment => (
                              <Row key={assignment.id}>
                                <Col sm={12}>
                                  <Box
                                    title={
                                      <>
                                        <AssignmentIcon gapRight className="text-muted" />
                                        <LocalizedExerciseName
                                          entity={{ name: '??', localizedTexts: assignment.localizedTexts }}
                                        />
                                        <small className="ml-3 text-nowrap">
                                          (
                                          <Link to={links.ASSIGNMENT_STATS_URI_FACTORY(assignment.id)}>
                                            <FormattedMessage
                                              id="app.groupUserSolutions.allAssignmentSolutions"
                                              defaultMessage="all assignment solutions"
                                            />
                                          </Link>
                                          )
                                        </small>
                                      </>
                                    }
                                    collapsable
                                    isOpen
                                    noPadding
                                    unlimitedHeight>
                                    <SolutionsTable
                                      solutions={getAssignmentSolutionsSorted(assignment.id)}
                                      assignmentId={assignment.id}
                                      groupId={groupId}
                                      runtimeEnvironments={assignmentEnvironmentsSelector(assignment.id).map(getJsData)}
                                      noteMaxlen={160}
                                    />
                                  </Box>
                                </Col>
                              </Row>
                            ))}
                          </div>
                        ) : (
                          <Box
                            title={
                              <FormattedMessage
                                id="app.groupUserSolutions.userSolutions"
                                defaultMessage="User Solutions"
                              />
                            }
                            unlimitedHeight
                            noPadding>
                            <SortableTable
                              hover
                              columns={prepareTableColumnDescriptors(assignments, groupId, locale, links)}
                              defaultOrder="date"
                              data={prepareTableData(
                                assignments,
                                getAssignmentSolutions,
                                getRuntime,
                                this.state.onlyBestSolutionsCheckbox
                              )}
                              empty={
                                <div className="text-center text-muted">
                                  <FormattedMessage
                                    id="app.groupUserSolutions.noSolutions"
                                    defaultMessage="The user has not submitted any solutions yet."
                                  />
                                </div>
                              }
                            />
                          </Box>
                        )
                      }
                    </FetchManyResourceRenderer>
                  )}
                </FetchManyResourceRenderer>
              )}
            </ResourceRenderer>
          </div>
        )}
      </Page>
    );
  }
}

GroupUserSolutions.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  assignments: ImmutablePropTypes.list,
  assignmentEnvironmentsSelector: PropTypes.func,
  fetchSolutionsStatus: PropTypes.string,
  fetchRuntimesStatus: PropTypes.string,
  getAssignmentSolutions: PropTypes.func.isRequired,
  getAssignmentSolutionsSorted: PropTypes.func.isRequired,
  getRuntime: PropTypes.func,
  loadAsync: PropTypes.func.isRequired,
  intl: PropTypes.object,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { groupId, userId },
        },
      }
    ) => {
      return {
        groupId,
        userId,
        group: groupSelector(state, groupId),
        groupsAccessor: groupDataAccessorSelector(state),
        assignments: groupsAssignmentsSelector(state, groupId),
        assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
        fetchSolutionsStatus: fetchManyGroupStudentsSolutionsStatus(state)(groupId, userId),
        fetchRuntimesStatus: fetchRuntimeEnvironmentsStatus(state),
        getAssignmentSolutions: assignmentId => getUserSolutions(state)(userId, assignmentId),
        getAssignmentSolutionsSorted: assignmentId => getUserSolutionsSortedData(state)(userId, assignmentId),
        getRuntime: runtimeEnvironmentSelector(state),
        loggedUserId: loggedInUserIdSelector(state),
      };
    },
    (
      dispatch,
      {
        match: {
          params: { groupId, userId },
        },
      }
    ) => ({
      loadAsync: () => GroupUserSolutions.loadAsync({ groupId, userId }, dispatch),
    })
  )(injectIntl(GroupUserSolutions))
);
