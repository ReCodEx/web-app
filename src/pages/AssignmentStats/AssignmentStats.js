import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, FormattedNumber, intlShape } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router';
import { defaultMemoize } from 'reselect';

import Button from '../../components/widgets/FlatButton';
import { usersSelector } from '../../redux/selectors/users';
import { groupSelector, studentsOfGroup } from '../../redux/selectors/groups';
import {
  getAssignment,
  assignmentEnvironmentsSelector,
  getUserSolutions,
  getAssigmentSolutions,
} from '../../redux/selectors/assignments';

import { fetchStudents } from '../../redux/modules/users';
import { isReady, getJsData, getId } from '../../redux/helpers/resourceManager';
import { fetchAssignmentIfNeeded, downloadBestSolutionsArchive } from '../../redux/modules/assignments';
import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import Box from '../../components/widgets/Box';
import { ResubmitAllSolutionsContainer } from '../../containers/ResubmitSolutionContainer';
import HierarchyLineContainer from '../../containers/HierarchyLineContainer';
import { EditIcon, DownloadIcon, SendIcon } from '../../components/icons';
import AssignmentStatusIcon, { getStatusDesc } from '../../components/Assignments/Assignment/AssignmentStatusIcon';
import CommentsIcon from '../../components/Assignments/SolutionsTable/CommentsIcon';
import SortableTable, { SortableTableColumnDescriptor } from '../../components/widgets/SortableTable';
import UsersName from '../../components/Users/UsersName';
import DateTime from '../../components/widgets/DateTime';
import Points from '../../components/Assignments/SolutionsTable/Points';
import EnvironmentsListItem from '../../components/helpers/EnvironmentsList/EnvironmentsListItem';
import DeleteSolutionButtonContainer from '../../containers/DeleteSolutionButtonContainer/DeleteSolutionButtonContainer';
import AcceptSolutionContainer from '../../containers/AcceptSolutionContainer';

import { safeGet, identity } from '../../helpers/common';
import { createUserNameComparator } from '../../components/helpers/users';
import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/localizedData';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import { fetchAssignmentSolutions } from '../../redux/modules/solutions';
import { fetchManyAssignmentSolutionsStatus } from '../../redux/selectors/solutions';
import LoadingSolutionsTable from '../../components/Assignments/SolutionsTable/LoadingSolutionsTable';
import FailedLoadingSolutionsTable from '../../components/Assignments/SolutionsTable/FailedLoadingSolutionsTable';
import OnOffCheckbox from '../../components/forms/OnOffCheckbox';

const prepareTableColumnDescriptors = defaultMemoize((loggedUserId, assignmentId, locale, links) => {
  const { SOLUTION_DETAIL_URI_FACTORY } = links;
  const nameComparator = createUserNameComparator(locale);

  const columns = [
    new SortableTableColumnDescriptor('icon', '', {
      className: 'text-nowrap',
      cellRenderer: info => (
        <React.Fragment>
          <AssignmentStatusIcon
            id={info.id}
            status={getStatusDesc(
              info.lastSubmission ? info.lastSubmission.evaluationStatus : null,
              info.lastSubmission
            )}
            accepted={info.accepted}
            isBestSolution={info.isBestSolution}
          />
          <CommentsIcon id={info.id} commentsStats={info.commentsStats} gapLeft />
        </React.Fragment>
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

    new SortableTableColumnDescriptor('user', <FormattedMessage id="generic.name" defaultMessage="Name" />, {
      className: 'text-left',
      comparator: ({ user: u1, date: d1 }, { user: u2, date: d2 }) => nameComparator(u1, u2) || d2 - d1, // dates are implicitly in reversed order
      cellRenderer: user =>
        user && <UsersName {...user} currentUserId={loggedUserId} showEmail="icon" showExternalIdentifiers />,
    }),

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
        <React.Fragment>
          {solution.permissionHints && solution.permissionHints.viewDetail && (
            <Link
              to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, solution.id)}
              className="btn btn-flat btn-default btn-xs">
              <SendIcon gapRight />
              <FormattedMessage id="generic.detail" defaultMessage="Detail" />
            </Link>
          )}
          {solution.permissionHints && solution.permissionHints.setAccepted && (
            <AcceptSolutionContainer id={solution.id} locale={locale} shortLabel bsSize="xs" />
          )}
          {solution.permissionHints && solution.permissionHints.delete && (
            <DeleteSolutionButtonContainer id={solution.id} bsSize="xs" />
          )}
        </React.Fragment>
      ),
    }),
  ];

  return columns;
});

const prepareTableData = defaultMemoize((assigmentSolutions, users, runtimeEnvironments, onlyBestSolutionsCheckbox) => {
  return assigmentSolutions
    .toArray()
    .map(getJsData)
    .filter(onlyBestSolutionsCheckbox ? solution => solution && solution.isBestSolution : identity)
    .map(
      ({
        id,
        lastSubmission,
        solution,
        runtimeEnvironmentId,
        note,
        maxPoints,
        bonusPoints,
        actualPoints,
        accepted,
        isBestSolution,
        commentsStats,
        permissionHints,
      }) => {
        const statusEvaluated =
          lastSubmission &&
          (lastSubmission.evaluationStatus === 'done' || lastSubmission.evaluationStatus === 'failed');
        const userId = solution && solution.userId;
        return {
          icon: { id, commentsStats, lastSubmission, accepted, isBestSolution },
          user: users.find(({ id }) => id === userId),
          date: solution && solution.createdAt,
          validity: statusEvaluated ? safeGet(lastSubmission, ['evaluation', 'score']) : null,
          points: statusEvaluated ? { maxPoints, bonusPoints, actualPoints } : { actualPoints: null },
          runtimeEnvironment: runtimeEnvironments.find(({ id }) => id === runtimeEnvironmentId),
          note,
          actionButtons: { id, permissionHints },
        };
      }
    );
});

class AssignmentStats extends Component {
  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId))
        .then(res => res.value)
        .then(assignment =>
          Promise.all([dispatch(fetchGroupIfNeeded(assignment.groupId)), dispatch(fetchStudents(assignment.groupId))])
        ),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchAssignmentSolutions(assignmentId)),
    ]);

  state = { groupByUsersCheckbox: true, onlyBestSolutionsCheckbox: false };

  checkboxClickHandler = ev => {
    this.setState({ [ev.target.name]: !this.state[ev.target.name] });
  };

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.assignmentId !== prevProps.assignmentId) {
      this.props.loadAsync();
    }
  }

  getArchiveFileName = assignment => {
    const {
      assignmentId,
      intl: { locale: pageLocale },
    } = this.props;
    const name =
      assignment &&
      safeGet(assignment, ['localizedTexts', ({ locale }) => locale === pageLocale, 'name'], assignment.name);
    const safeName = name && name.normalize('NFD').replace(/[^-_a-zA-Z0-9.()[\] ]/g, '');
    return `${safeName || assignmentId}.zip`;
  };

  sortSolutions(solutions) {
    return solutions.sort((a, b) => {
      var aTimestamp = a.getIn(['data', 'solution', 'createdAt']);
      var bTimestamp = b.getIn(['data', 'solution', 'createdAt']);
      return bTimestamp - aTimestamp;
    });
  }

  // Re-format the data, so they can be rendered by the SortableTable ...
  render() {
    const {
      loggedUserId,
      assignmentId,
      assignment,
      getStudents,
      getGroup,
      getUserSolutions,
      runtimeEnvironments,
      assigmentSolutions,
      downloadBestSolutionsArchive,
      fetchManyStatus,
      intl: { locale },
      links,
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={assignment => getLocalizedName(assignment, locale)}
        description={<FormattedMessage id="app.assignmentStats.title" defaultMessage="Assignment statistics" />}
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'users',
            breadcrumb: assignment => ({
              text: <FormattedMessage id="app.group.title" defaultMessage="Group detail" />,
              link: ({ GROUP_DETAIL_URI_FACTORY }) => GROUP_DETAIL_URI_FACTORY(assignment.groupId),
            }),
          },
          {
            resource: assignment,
            iconName: 'puzzle-piece',
            breadcrumb: assignment => ({
              text: <FormattedMessage id="app.exercise.title" defaultMessage="Exercise" />,
              link: ({ EXERCISE_URI_FACTORY }) => EXERCISE_URI_FACTORY(assignment.exerciseId),
            }),
          },
          {
            resource: assignment,
            iconName: 'hourglass-start',
            breadcrumb: assignment => ({
              text: <FormattedMessage id="app.assignment.title" defaultMessage="Exercise assignment" />,
              link: ({ ASSIGNMENT_DETAIL_URI_FACTORY }) => ASSIGNMENT_DETAIL_URI_FACTORY(assignment.id),
            }),
          },
          {
            text: <FormattedMessage id="app.assignmentStats.title" defaultMessage="Assignment statistics" />,
            iconName: 'chart-line',
          },
        ]}>
        {assignment => (
          <div>
            <HierarchyLineContainer groupId={assignment.groupId} />

            <Row>
              <Col md={12} lg={7}>
                <p>
                  <LinkContainer to={links.ASSIGNMENT_EDIT_URI_FACTORY(assignment.id)}>
                    <Button bsStyle="warning">
                      <EditIcon gapRight />
                      <FormattedMessage id="app.assignment.editSettings" defaultMessage="Edit Assignment" />
                    </Button>
                  </LinkContainer>
                  <a href="#" onClick={downloadBestSolutionsArchive(this.getArchiveFileName(assignment))}>
                    <Button bsStyle="primary">
                      <DownloadIcon gapRight />
                      <FormattedMessage
                        id="app.assignment.downloadBestSolutionsArchive"
                        defaultMessage="Download Best Solutions"
                      />
                    </Button>
                  </a>
                  <ResubmitAllSolutionsContainer assignmentId={assignment.id} />
                </p>
              </Col>
              <Col md={12} lg={5} className="text-right text-nowrap">
                <OnOffCheckbox
                  checked={this.state.groupByUsersCheckbox}
                  disabled={this.state.onlyBestSolutionsCheckbox}
                  name="groupByUsersCheckbox"
                  onChange={this.checkboxClickHandler}>
                  <span className="em-padding-right">
                    <FormattedMessage id="app.assignmentStats.groupByUsersCheckbox" defaultMessage="Group by users" />
                  </span>
                </OnOffCheckbox>
                <OnOffCheckbox
                  checked={this.state.onlyBestSolutionsCheckbox}
                  name="onlyBestSolutionsCheckbox"
                  onChange={this.checkboxClickHandler}>
                  <span className="em-padding-right">
                    <FormattedMessage
                      id="app.assignmentStats.onlyBestSolutionsCheckbox"
                      defaultMessage="Best solutions only"
                    />
                  </span>
                </OnOffCheckbox>
              </Col>
            </Row>

            <ResourceRenderer resource={[getGroup(assignment.groupId), ...runtimeEnvironments]}>
              {(group, ...runtimes) => (
                <FetchManyResourceRenderer
                  fetchManyStatus={fetchManyStatus}
                  loading={<LoadingSolutionsTable />}
                  failed={<FailedLoadingSolutionsTable />}>
                  {() =>
                    this.state.groupByUsersCheckbox && !this.state.onlyBestSolutionsCheckbox ? (
                      <div>
                        {getStudents(group.id)
                          .sort(
                            (a, b) =>
                              a.name.lastName.localeCompare(b.name.lastName, locale) ||
                              a.name.firstName.localeCompare(b.name.firstName, locale)
                          )
                          .map(user => (
                            <Row key={user.id}>
                              <Col sm={12}>
                                <SolutionsTable
                                  title={user.fullName}
                                  solutions={this.sortSolutions(getUserSolutions(user.id)).map(getJsData)}
                                  assignmentId={assignmentId}
                                  runtimeEnvironments={runtimes}
                                  noteMaxlen={160}
                                />
                              </Col>
                            </Row>
                          ))}
                      </div>
                    ) : (
                      <Box
                        title={
                          <FormattedMessage
                            id="app.assignmentStats.assignmentSolutions"
                            defaultMessage="Assignment Solutions"
                          />
                        }
                        unlimitedHeight
                        noPadding>
                        <SortableTable
                          hover
                          columns={prepareTableColumnDescriptors(loggedUserId, assignmentId, locale, links)}
                          defaultOrder="date"
                          data={prepareTableData(
                            assigmentSolutions,
                            getStudents(group.id),
                            runtimes,
                            this.state.onlyBestSolutionsCheckbox
                          )}
                          empty={
                            <div className="text-center text-muted">
                              <FormattedMessage
                                id="app.assignmentStats.noSolutions"
                                defaultMessage="There are currently no submitted solutions."
                              />
                            </div>
                          }
                        />
                      </Box>
                    )
                  }
                </FetchManyResourceRenderer>
              )}
            </ResourceRenderer>
          </div>
        )}
      </Page>
    );
  }
}

AssignmentStats.propTypes = {
  loggedUserId: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  assignment: PropTypes.object,
  getStudents: PropTypes.func.isRequired,
  getGroup: PropTypes.func.isRequired,
  getUserSolutions: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.array,
  assigmentSolutions: ImmutablePropTypes.list,
  loadAsync: PropTypes.func.isRequired,
  downloadBestSolutionsArchive: PropTypes.func.isRequired,
  fetchManyStatus: PropTypes.string,
  intl: intlShape,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    (state, { params: { assignmentId } }) => {
      const assignment = getAssignment(state)(assignmentId);
      const getStudentsIds = groupId => studentsOfGroup(groupId)(state);
      const readyUsers = usersSelector(state)
        .toArray()
        .filter(isReady);

      return {
        loggedUserId: loggedInUserIdSelector(state),
        assignmentId,
        assignment,
        getStudentsIds,
        getStudents: groupId => readyUsers.filter(user => getStudentsIds(groupId).includes(getId(user))).map(getJsData),
        getUserSolutions: userId => getUserSolutions(state, userId, assignmentId),
        assigmentSolutions: getAssigmentSolutions(state, assignmentId),
        getGroup: id => groupSelector(state, id),
        runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId),
        fetchManyStatus: fetchManyAssignmentSolutionsStatus(assignmentId)(state),
      };
    },
    (dispatch, { params: { assignmentId } }) => ({
      loadAsync: () => AssignmentStats.loadAsync({ assignmentId }, dispatch),
      downloadBestSolutionsArchive: name => ev => {
        ev.preventDefault();
        dispatch(downloadBestSolutionsArchive(assignmentId, name));
      },
    })
  )(injectIntl(AssignmentStats))
);
