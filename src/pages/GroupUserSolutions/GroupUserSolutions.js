import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import { lruMemoize } from 'reselect';

import DeleteSolutionButtonContainer from '../../containers/DeleteSolutionButtonContainer/DeleteSolutionButtonContainer.js';
import SolutionActionsContainer from '../../containers/SolutionActionsContainer';

import Page from '../../components/layout/Page';
import { GroupNavigation } from '../../components/layout/Navigation';
import Icon, {
  AssignmentIcon,
  BanIcon,
  DetailIcon,
  CodeFileIcon,
  LoadingIcon,
  PlagiarismIcon,
  UserIcon,
} from '../../components/icons';
import SolutionTableRowIcons from '../../components/Assignments/SolutionsTable/SolutionTableRowIcons.js';
import Points from '../../components/Assignments/SolutionsTable/Points.js';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import OnOffCheckbox from '../../components/forms/OnOffCheckbox';
import Box from '../../components/widgets/Box';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import DateTime from '../../components/widgets/DateTime';
import SortableTable, { SortableTableColumnDescriptor } from '../../components/widgets/SortableTable';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import EnvironmentsListItem from '../../components/helpers/EnvironmentsList/EnvironmentsListItem.js';
import GroupArchivedWarning from '../../components/Groups/GroupArchivedWarning/GroupArchivedWarning.js';
import GroupExamPending from '../../components/Groups/GroupExamPending';
import Callout from '../../components/widgets/Callout';

import { fetchUserIfNeeded } from '../../redux/modules/users.js';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments.js';
import { fetchGroupIfNeeded } from '../../redux/modules/groups.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { fetchGroupStudentsSolutions, fetchAssignmentSolversIfNeeded } from '../../redux/modules/solutions.js';
import { setSolutionReviewState } from '../../redux/modules/solutionReviews.js';
import { groupSelector, groupsAssignmentsSelector, groupDataAccessorSelector } from '../../redux/selectors/groups.js';
import { loggedInUserSelector } from '../../redux/selectors/users.js';
import {
  assignmentEnvironmentsSelector,
  getUserSolutions,
  getUserSolutionsSortedData,
} from '../../redux/selectors/assignments.js';
import {
  fetchManyGroupStudentsSolutionsStatus,
  isAssignmentSolversLoading,
  getAssignmentSolverSelector,
} from '../../redux/selectors/solutions.js';
import {
  runtimeEnvironmentSelector,
  fetchRuntimeEnvironmentsStatus,
} from '../../redux/selectors/runtimeEnvironments.js';
import { getJsData } from '../../redux/helpers/resourceManager';
import { compareAssignmentsReverted } from '../../components/helpers/assignments.js';

import { storageGetItem, storageSetItem } from '../../helpers/localStorage.js';
import { getLocalizedName } from '../../helpers/localizedData.js';
import withLinks from '../../helpers/withLinks.js';
import withRouter, { withRouterProps } from '../../helpers/withRouter.js';
import { safeGet, identity, hasPermissions, unique } from '../../helpers/common.js';

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

const prepareTableColumnDescriptors = lruMemoize((assignments, groupId, locale, links) => {
  const {
    SOLUTION_DETAIL_URI_FACTORY,
    SOLUTION_SOURCE_CODES_URI_FACTORY,
    ASSIGNMENT_DETAIL_URI_FACTORY,
    ASSIGNMENT_SOLUTIONS_URI_FACTORY,
  } = links;

  const assignmentsComparator = prepareCachedAssignmentsComparator(assignments, locale);

  const columns = [
    new SortableTableColumnDescriptor('icon', '', {
      className: 'text-nowrap',
      cellRenderer: solution => (
        <SolutionTableRowIcons
          id={solution.id}
          assignmentId={solution.assignmentId}
          solution={solution}
          permissionHints={solution.permissionHints}
        />
      ),
    }),

    new SortableTableColumnDescriptor(
      'date',
      <FormattedMessage id="app.solutionsTable.submissionDate" defaultMessage="Date of submission" />,
      {
        className: 'text-start',
        comparator: ({ date: d1 }, { date: d2 }) => d2 - d1, // dates are implicitly in reversed order
        cellRenderer: (createdAt, idx) =>
          createdAt && <DateTime unixts={createdAt} showOverlay overlayTooltipId={`datetime-${idx}`} />,
      }
    ),

    new SortableTableColumnDescriptor(
      'assignment',
      <FormattedMessage id="app.solutionsTable.assignment" defaultMessage="Assignment" />,
      {
        className: 'text-start',
        comparator: ({ assignment: a1, date: d1 }, { assignment: a2, date: d2 }) =>
          assignmentsComparator(a1, a2) || d2 - d1, // dates are implicitly in reversed order
        cellRenderer: assignment =>
          assignment && (
            <small className="text-nowrap">
              {hasPermissions(assignment, 'viewAssignmentSolutions') ? (
                <Link to={ASSIGNMENT_SOLUTIONS_URI_FACTORY(assignment.id)}>
                  <LocalizedExerciseName entity={{ name: '??', localizedTexts: assignment.localizedTexts }} />
                </Link>
              ) : (
                <Link to={ASSIGNMENT_DETAIL_URI_FACTORY(assignment.id)}>
                  <LocalizedExerciseName entity={{ name: '??', localizedTexts: assignment.localizedTexts }} />
                </Link>
              )}
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
        cellRenderer: (validity, _1, _2, rowData) =>
          validity !== null ? (
            <span className={`${rowData?.icon?.isBestSolution ? 'fw-bold' : ''}`}>
              <FormattedNumber style="percent" value={validity} />
            </span>
          ) : (
            <span className="text-danger">&ndash;</span>
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
        cellRenderer: (points, _1, _2, rowData) =>
          points.actualPoints !== null ? (
            <span className={`${rowData?.icon?.isBestSolution ? 'fw-bold' : ''}`}>
              <Points points={points.actualPoints} bonusPoints={points.bonusPoints} maxPoints={points.maxPoints} />
            </span>
          ) : (
            <span className="text-danger">&ndash;</span>
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
      className: 'small w-100',
      headerClassName: 'text-start',
    }),

    new SortableTableColumnDescriptor('actionButtons', '', {
      className: 'text-end align-middle text-nowrap',
      cellRenderer: solution => (
        <TheButtonGroup>
          {solution.permissionHints && solution.permissionHints.viewDetail && (
            <>
              <Link to={SOLUTION_DETAIL_URI_FACTORY(solution.assignmentId, solution.id)}>
                <Button size="xs" variant="secondary">
                  <DetailIcon gapRight={2} />
                  <FormattedMessage id="generic.detail" defaultMessage="Detail" />
                </Button>
              </Link>
              <Link to={SOLUTION_SOURCE_CODES_URI_FACTORY(solution.assignmentId, solution.id)}>
                <Button size="xs" variant="primary">
                  <CodeFileIcon fixedWidth gapRight={2} />
                  <FormattedMessage id="generic.files" defaultMessage="Files" />
                </Button>
              </Link>
            </>
          )}
          {solution.permissionHints && (solution.permissionHints.setFlag || solution.permissionHints.review) && (
            <SolutionActionsContainer id={solution.id} showAllButtons dropdown />
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

const prepareTableData = lruMemoize((assignments, getAssignmentSolutions, getRuntime, onlyBestSolutionsCheckbox) => {
  const res = [];
  assignments.forEach(assignment =>
    getAssignmentSolutions(assignment.id)
      .toArray()
      .map(getJsData)
      .filter(onlyBestSolutionsCheckbox ? solution => solution && solution.isBestSolution : identity)
      .forEach(s => {
        const statusEvaluated = s.lastSubmission && (s.lastSubmission.evaluation || s.lastSubmission.failure);
        const rte = getRuntime(s.runtimeEnvironmentId);

        res.push({
          icon: s,
          assignment,
          date: s.createdAt,
          validity: statusEvaluated ? safeGet(s.lastSubmission, ['evaluation', 'score']) : null,
          points: statusEvaluated ? s : { actualPoints: null },
          runtimeEnvironment: rte && getJsData(rte),
          note: s.note,
          actionButtons: s,
        });
      })
  );

  return res;
});

const getPendingReviewSolutions = lruMemoize((assignments, getAssignmentSolutions) =>
  assignments
    ? assignments
        .toArray()
        .map(getJsData)
        .filter(identity)
        .reduce(
          (acc, assignment) => [
            ...acc,
            ...getAssignmentSolutions(assignment.id)
              .toArray()
              .map(getJsData)
              .filter(
                solution => solution && solution.review && solution.review.startedAt && !solution.review.closedAt
              ),
          ],
          []
        )
    : []
);

const getPlagiarisms = lruMemoize((assignments, getAssignmentSolutions) =>
  assignments
    ? assignments
        .toArray()
        .map(getJsData)
        .filter(identity)
        .reduce(
          (acc, assignment) => [
            ...acc,
            ...getAssignmentSolutions(assignment.id)
              .toArray()
              .map(getJsData)
              .filter(solution => solution && solution.plagiarism),
          ],
          []
        )
    : []
);

const getPlagiarismUniqueAssignments = lruMemoize(plagiarisms =>
  unique(plagiarisms.map(({ assignmentId }) => assignmentId))
);

const localStorageStateKey = 'GroupUserSolutions.state';

class GroupUserSolutions extends Component {
  static loadAsync = ({ groupId, userId }, dispatch, navigate, { GROUP_STUDENTS_URI_FACTORY, DASHBOARD_URI }) =>
    Promise.all([
      dispatch(fetchUserIfNeeded(userId)),
      dispatch(fetchGroupIfNeeded(groupId)).then(({ value: group }) => {
        if (group?.privateData?.students?.find(sid => sid === userId) === undefined) {
          navigate(hasPermissions(group, 'viewAssignments') ? GROUP_STUDENTS_URI_FACTORY(groupId) : DASHBOARD_URI);
          return Promise.resolve();
        }

        return Promise.all(
          hasPermissions(group, 'viewAssignments')
            ? [
                dispatch(fetchAssignmentsForGroup(groupId)),
                dispatch(fetchGroupStudentsSolutions(groupId, userId)),
                dispatch(fetchAssignmentSolversIfNeeded({ groupId, userId })),
              ]
            : []
        );
      }),
      dispatch(fetchRuntimeEnvironments()),
    ]);

  state = {
    groupByAssignmentsCheckbox: true,
    onlyBestSolutionsCheckbox: false,
    closingReviews: false,
    closingReviewsFailed: false,
  };

  checkboxClickHandler = ev => {
    this.setState({ [ev.target.name]: !this.state[ev.target.name] }, () => {
      // callback after the state is updated
      storageSetItem(localStorageStateKey, {
        groupByAssignmentsCheckbox: this.state.groupByAssignmentsCheckbox,
        onlyBestSolutionsCheckbox: this.state.onlyBestSolutionsCheckbox,
      });
    });
  };

  componentDidMount() {
    this.props.loadAsync();
    this.setState(storageGetItem(localStorageStateKey, null));
  }

  componentDidUpdate(prevProps) {
    if (this.props.groupId !== prevProps.groupId || this.props.userId !== prevProps.userId) {
      this.props.loadAsync();
    }
  }

  closeReviews = solutions => {
    this.setState({ closingReviews: true, closingReviewsFailed: false });
    return Promise.all(solutions.map(({ id }) => this.props.closeReview(id))).then(
      () => this.setState({ closingReviews: false }),
      () => this.setState({ closingReviews: false, closingReviewsFailed: true })
    );
  };

  openLinkGenerator = ({ actionButtons: { id, assignmentId, permissionHints } }) => {
    const {
      links: { SOLUTION_DETAIL_URI_FACTORY },
    } = this.props;
    return permissionHints && permissionHints.viewDetail ? SOLUTION_DETAIL_URI_FACTORY(assignmentId, id) : null;
  };

  // Re-format the data, so they can be rendered by the SortableTable ...
  render() {
    const {
      groupId,
      userId,
      group,
      currentUser,
      groupsAccessor,
      assignments,
      assignmentEnvironmentsSelector,
      getAssignmentSolutions,
      getAssignmentSolutionsSorted,
      getRuntime,
      fetchSolutionsStatus,
      fetchRuntimesStatus,
      assignmentSolversLoading,
      assignmentSolverSelector,
      intl: { locale },
      links,
    } = this.props;

    const pendingReviews = getPendingReviewSolutions(assignments, getAssignmentSolutions);
    const plagiarisms = getPlagiarisms(assignments, getAssignmentSolutions);

    return (
      <Page
        resource={[group, currentUser]}
        icon={<UserIcon />}
        title={
          <FormattedMessage id="app.groupUserSolutions.title" defaultMessage="All Submissions of Selected User" />
        }>
        {(group, currentUser) =>
          hasPermissions(group, 'viewAssignments') ? (
            <div>
              {group.privateData && <GroupNavigation group={group} userId={userId} />}

              {group.privateData && <GroupExamPending {...group} currentUser={currentUser} />}

              <GroupArchivedWarning
                {...group}
                groupsDataAccessor={groupsAccessor}
                linkFactory={links.GROUP_EDIT_URI_FACTORY}
              />

              <FetchManyResourceRenderer fetchManyStatus={fetchSolutionsStatus} loading={null} failed={null}>
                {() =>
                  plagiarisms &&
                  plagiarisms.length > 0 && (
                    <Callout variant="danger" icon={<PlagiarismIcon />}>
                      <FormattedMessage
                        id="app.assignmentSolutions.plagiarismsDetected.assignments"
                        defaultMessage="There {count, plural, one {is} other {are}} {count} {count, plural, one {solution} other {solutions}} (of {assignments} {assignments, plural, one {assignment} other {assignments}}) with detected similarities. Such solutions may be plagiarisms."
                        values={{
                          count: plagiarisms.length,
                          assignments: getPlagiarismUniqueAssignments(plagiarisms).length,
                        }}
                      />
                    </Callout>
                  )
                }
              </FetchManyResourceRenderer>

              {pendingReviews &&
                pendingReviews.length > 0 &&
                !group.archived &&
                hasPermissions(pendingReviews[0], 'review') && (
                  <Callout variant="warning">
                    <Row className="align-items-center">
                      <Col className="pe-3 py-2">
                        <FormattedMessage
                          id="app.groupUserSolutions.pendingReviews"
                          defaultMessage="There {count, plural, one {is} other {are}} {count} pending {count, plural, one {review} other {reviews}} among the solutions of the selected user. Remember that the review comments are visible to the author after a review is closed."
                          values={{ count: pendingReviews.length }}
                        />
                      </Col>
                      <Col xl="auto">
                        <Button
                          variant={this.state.closingReviewsFailed ? 'danger' : 'success'}
                          onClick={() => this.closeReviews(pendingReviews)}
                          disabled={this.state.closingReviews}>
                          {this.state.closingReviews ? (
                            <LoadingIcon gapRight={2} />
                          ) : (
                            <Icon icon="boxes-packing" gapRight={2} />
                          )}
                          <FormattedMessage
                            id="app.reviewSolutionButtons.closePendingReviews"
                            defaultMessage="Close pending reviews"
                          />
                        </Button>
                      </Col>
                    </Row>
                  </Callout>
                )}

              <div className="text-end text-nowrap py-2">
                <OnOffCheckbox
                  className="text-start me-3"
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
                  className="text-start me-3"
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
                                          <AssignmentIcon gapRight={2} className="text-body-secondary" />
                                          <LocalizedExerciseName
                                            entity={{ name: '??', localizedTexts: assignment.localizedTexts }}
                                          />

                                          <small className="ms-3 text-nowrap">
                                            (
                                            {hasPermissions(assignment, 'viewAssignmentSolutions') ? (
                                              <Link to={links.ASSIGNMENT_SOLUTIONS_URI_FACTORY(assignment.id)}>
                                                <FormattedMessage
                                                  id="app.groupUserSolutions.allAssignmentSolutions"
                                                  defaultMessage="all assignment solutions"
                                                />
                                              </Link>
                                            ) : (
                                              <Link to={links.ASSIGNMENT_DETAIL_URI_FACTORY(assignment.id)}>
                                                <FormattedMessage
                                                  id="app.groupUserSolutions.assignmentDetail"
                                                  defaultMessage="assignment detail"
                                                />
                                              </Link>
                                            )}
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
                                        runtimeEnvironments={assignmentEnvironmentsSelector(assignment.id).map(
                                          getJsData
                                        )}
                                        noteMaxlen={160}
                                        assignmentSolversLoading={assignmentSolversLoading}
                                        assignmentSolver={assignmentSolverSelector(assignment.id, userId)}
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
                                id="GroupUserSolutions"
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
                                  <div className="text-center text-body-secondary">
                                    <FormattedMessage
                                      id="app.groupUserSolutions.noSolutions"
                                      defaultMessage="The user has not submitted any solutions yet."
                                    />
                                  </div>
                                }
                                className="mb-0"
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
          ) : (
            <Row>
              <Col sm={12}>
                <Callout variant="warning" className="larger" icon={<BanIcon />}>
                  <FormattedMessage
                    id="generic.accessDenied"
                    defaultMessage="You do not have permissions to see this page. If you got to this page via a seemingly legitimate link or button, please report a bug."
                  />
                </Callout>
              </Col>
            </Row>
          )
        }
      </Page>
    );
  }
}

GroupUserSolutions.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  currentUser: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  assignments: ImmutablePropTypes.list,
  assignmentEnvironmentsSelector: PropTypes.func,
  fetchSolutionsStatus: PropTypes.string,
  fetchRuntimesStatus: PropTypes.string,
  getAssignmentSolutions: PropTypes.func.isRequired,
  getAssignmentSolutionsSorted: PropTypes.func.isRequired,
  getRuntime: PropTypes.func,
  assignmentSolversLoading: PropTypes.bool,
  assignmentSolverSelector: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  closeReview: PropTypes.func.isRequired,
  intl: PropTypes.object,
  links: PropTypes.object.isRequired,
  navigate: withRouterProps.navigate,
};

export default withRouter(
  withLinks(
    connect(
      (state, { params: { groupId, userId } }) => {
        return {
          groupId,
          userId,
          group: groupSelector(state, groupId),
          currentUser: loggedInUserSelector(state),
          groupsAccessor: groupDataAccessorSelector(state),
          assignments: groupsAssignmentsSelector(state, groupId),
          assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
          fetchSolutionsStatus: fetchManyGroupStudentsSolutionsStatus(state)(groupId, userId),
          fetchRuntimesStatus: fetchRuntimeEnvironmentsStatus(state),
          getAssignmentSolutions: assignmentId => getUserSolutions(state)(userId, assignmentId),
          getAssignmentSolutionsSorted: assignmentId => getUserSolutionsSortedData(state)(userId, assignmentId),
          getRuntime: runtimeEnvironmentSelector(state),
          assignmentSolversLoading: isAssignmentSolversLoading(state),
          assignmentSolverSelector: getAssignmentSolverSelector(state),
        };
      },
      (dispatch, { params: { groupId, userId }, navigate, links }) => ({
        loadAsync: () => GroupUserSolutions.loadAsync({ groupId, userId }, dispatch, navigate, links),
        closeReview: id => dispatch(setSolutionReviewState(id, true)),
      })
    )(injectIntl(GroupUserSolutions))
  )
);
