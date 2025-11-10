import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col, Modal, DropdownButton, Dropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import { lruMemoize } from 'reselect';

import { ResubmitAllSolutionsContainer } from '../../containers/ResubmitSolutionContainer';
import DeleteSolutionButtonContainer from '../../containers/DeleteSolutionButtonContainer/DeleteSolutionButtonContainer.js';
import SolutionActionsContainer from '../../containers/SolutionActionsContainer';
import CommentThreadContainer from '../../containers/CommentThreadContainer';

import Page from '../../components/layout/Page';
import { AssignmentNavigation } from '../../components/layout/Navigation';
import Icon, {
  BanIcon,
  ChatIcon,
  DownloadIcon,
  DetailIcon,
  CodeFileIcon,
  LoadingIcon,
  PlagiarismCheckedIcon,
  PlagiarismIcon,
  ResultsIcon,
  UserIcon,
} from '../../components/icons';
import SolutionTableRowIcons from '../../components/Assignments/SolutionsTable/SolutionTableRowIcons.js';
import UsersName from '../../components/Users/UsersName';
import Points from '../../components/Assignments/SolutionsTable/Points.js';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import LoadingSolutionsTable from '../../components/Assignments/SolutionsTable/LoadingSolutionsTable.js';
import FailedLoadingSolutionsTable from '../../components/Assignments/SolutionsTable/FailedLoadingSolutionsTable.js';
import Box from '../../components/widgets/Box';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import DateTime from '../../components/widgets/DateTime';
import SortableTable, { SortableTableColumnDescriptor } from '../../components/widgets/SortableTable';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { createUserNameComparator } from '../../components/helpers/users.js';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import EnvironmentsListItem from '../../components/helpers/EnvironmentsList/EnvironmentsListItem.js';
import GroupArchivedWarning from '../../components/Groups/GroupArchivedWarning/GroupArchivedWarning.js';
import GroupExamPending from '../../components/Groups/GroupExamPending';
import Callout from '../../components/widgets/Callout';

import { fetchByIds } from '../../redux/modules/users.js';
import { fetchAssignmentIfNeeded, downloadBestSolutionsArchive } from '../../redux/modules/assignments.js';
import { fetchGroupIfNeeded } from '../../redux/modules/groups.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { fetchAssignmentSolutions, fetchAssignmentSolversIfNeeded } from '../../redux/modules/solutions.js';
import { setSolutionReviewState } from '../../redux/modules/solutionReviews.js';
import { usersSelector, loggedInUserSelector } from '../../redux/selectors/users.js';
import { groupSelector, groupDataAccessorSelector } from '../../redux/selectors/groups.js';
import { studentsIdsOfGroup } from '../../redux/selectors/usersGroups.js';
import {
  getAssignment,
  getAssignmentEnvironments,
  getUserSolutionsSortedData,
  getAssignmentSolutions,
} from '../../redux/selectors/assignments.js';
import { loggedInUserIdSelector } from '../../redux/selectors/auth.js';
import {
  fetchManyAssignmentSolutionsStatus,
  isAssignmentSolversLoading,
  getAssignmentSolverSelector,
  getOneAssignmentSolvers,
} from '../../redux/selectors/solutions.js';
import { isReady, getJsData, getId } from '../../redux/helpers/resourceManager';

import { storageGetItem, storageSetItem } from '../../helpers/localStorage.js';
import withLinks from '../../helpers/withLinks.js';
import { safeGet, identity, arrayToObject, toPlainAscii, hasPermissions, unique } from '../../helpers/common.js';

// View mode keys, labels, and filtering functions
const VIEW_MODE_DEFAULT = 'default';
const VIEW_MODE_GROUPED = 'grouped';
const VIEW_MODE_BEST = 'best';
const VIEW_MODE_LAST = 'last';
const VIEW_MODE_ACCEPTED = 'accepted';
const VIEW_MODE_REVIEWED = 'reviewed';
const VIEW_MODE_REVIEW_REQUESTS = 'review-requests';
const VIEW_MODE_PLAGIARISM = 'plagiarism';

const viewModes = {
  [VIEW_MODE_DEFAULT]: (
    <FormattedMessage id="app.assignmentSolutions.viewModes.default" defaultMessage="All solutions (default)" />
  ),
  [VIEW_MODE_GROUPED]: (
    <FormattedMessage id="app.assignmentSolutions.viewModes.grouped" defaultMessage="Grouped by users" />
  ),
  [VIEW_MODE_BEST]: (
    <FormattedMessage id="app.assignmentSolutions.viewModes.best" defaultMessage="Best solutions only" />
  ),
  [VIEW_MODE_LAST]: (
    <FormattedMessage id="app.assignmentSolutions.viewModes.last" defaultMessage="Latest solutions only" />
  ),
  [VIEW_MODE_ACCEPTED]: (
    <FormattedMessage id="app.assignmentSolutions.viewModes.accepted" defaultMessage="Accepted solutions only" />
  ),
  [VIEW_MODE_REVIEWED]: (
    <FormattedMessage id="app.assignmentSolutions.viewModes.reviewed" defaultMessage="Reviewed solutions only" />
  ),
  [VIEW_MODE_REVIEW_REQUESTS]: (
    <FormattedMessage id="app.assignmentSolutions.viewModes.reviewRequests" defaultMessage="Review requests" />
  ),
  [VIEW_MODE_PLAGIARISM]: (
    <FormattedMessage id="app.assignmentSolutions.viewModes.plagiarism" defaultMessage="Only plagiarism suspects" />
  ),
};

const _getLastAttemptIndices = lruMemoize(solutions => {
  const lastAttemptIndices = {};
  solutions.filter(identity).forEach(s => {
    lastAttemptIndices[s.authorId] = Math.max(s.attemptIndex || 0, lastAttemptIndices[s.authorId] || 0);
  });
  return lastAttemptIndices;
});

const viewModeFilters = {
  [VIEW_MODE_DEFAULT]: null,
  [VIEW_MODE_GROUPED]: null,
  [VIEW_MODE_BEST]: solution => solution && solution.isBestSolution,
  [VIEW_MODE_LAST]: (solution, _, solutions) =>
    solution && solution.attemptIndex === _getLastAttemptIndices(solutions)[solution.authorId],
  [VIEW_MODE_ACCEPTED]: solution => solution && solution.accepted,
  [VIEW_MODE_REVIEWED]: solution => solution && solution.review,
  [VIEW_MODE_REVIEW_REQUESTS]: solution => solution && !solution.review && solution.reviewRequest,
  [VIEW_MODE_PLAGIARISM]: solution => solution && solution.plagiarism,
};

const prepareTableColumnDescriptors = lruMemoize((loggedUserId, assignmentId, groupId, viewMode, locale, links) => {
  const { SOLUTION_DETAIL_URI_FACTORY, SOLUTION_SOURCE_CODES_URI_FACTORY, GROUP_USER_SOLUTIONS_URI_FACTORY } = links;
  const nameComparator = createUserNameComparator(locale);

  const columns = [
    new SortableTableColumnDescriptor('icon', '', {
      className: 'text-nowrap',
      cellRenderer: solution => (
        <SolutionTableRowIcons
          id={solution.id}
          assignmentId={assignmentId}
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
          createdAt && <DateTime unixTs={createdAt} showOverlay overlayTooltipId={`datetime-${idx}`} />,
      }
    ),

    new SortableTableColumnDescriptor('attempt', '#', {
      className: 'text-center',
      cellRenderer: ({ attemptIndex, lastAttemptIndex }) => (
        <small
          className={
            'text-nowrap' +
            (viewMode === VIEW_MODE_BEST && lastAttemptIndex && lastAttemptIndex !== attemptIndex
              ? ' fw-bold text-warning'
              : ' text-body-secondary')
          }>
          {!lastAttemptIndex ? (
            <LoadingIcon />
          ) : viewMode === VIEW_MODE_BEST && lastAttemptIndex && lastAttemptIndex === attemptIndex ? (
            attemptIndex
          ) : (
            <FormattedMessage
              id="app.solution.solutionAttemptValue"
              defaultMessage="{index} of {count}"
              values={{
                index: attemptIndex,
                count: lastAttemptIndex,
              }}
            />
          )}
        </small>
      ),
    }),

    new SortableTableColumnDescriptor('user', <FormattedMessage id="generic.nameOfPerson" defaultMessage="Name" />, {
      className: 'text-start',
      comparator: ({ user: u1, date: d1 }, { user: u2, date: d2 }) => nameComparator(u1, u2) || d2 - d1, // dates are implicitly in reversed order
      cellRenderer: user =>
        user && (
          <UsersName
            {...user}
            currentUserId={loggedUserId}
            showEmail="icon"
            showExternalIdentifiers
            link={GROUP_USER_SOLUTIONS_URI_FACTORY(groupId, user.id)}
            listItem
          />
        ),
    }),

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
              <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, solution.id)}>
                <Button size="xs" variant="secondary">
                  <DetailIcon gapRight={2} />
                  <FormattedMessage id="generic.detail" defaultMessage="Detail" />
                </Button>
              </Link>
              <Link to={SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, solution.id)}>
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

  return columns.filter(c => c);
});

const prepareTableData = lruMemoize((assignmentSolutions, users, assignmentSolvers, runtimeEnvironments, viewMode) => {
  const solvers = (assignmentSolvers && assignmentSolvers.toJS()) || {};
  const usersIndex = arrayToObject(users);
  return assignmentSolutions
    .toArray()
    .map(getJsData)
    .filter(solution => solution && usersIndex[solution.authorId])
    .filter(viewModeFilters[viewMode] || identity)
    .map(s => {
      const statusEvaluated = s.lastSubmission && (s.lastSubmission.evaluation || s.lastSubmission.failure);
      return {
        icon: s,
        user: usersIndex[s.authorId],
        date: s.createdAt,
        attempt: {
          attemptIndex: s.attemptIndex,
          lastAttemptIndex: solvers[s.authorId] && solvers[s.authorId].lastAttemptIndex,
        },
        validity: statusEvaluated ? safeGet(s.lastSubmission, ['evaluation', 'score']) : null,
        points: statusEvaluated ? s : { actualPoints: null },
        runtimeEnvironment: runtimeEnvironments.find(({ id }) => id === s.runtimeEnvironmentId),
        note: s.note,
        actionButtons: s,
      };
    });
});

const getPendingReviewSolutions = lruMemoize(assignmentSolutions =>
  assignmentSolutions
    .toArray()
    .map(getJsData)
    .filter(solution => solution && solution.review && solution.review.startedAt && !solution.review.closedAt)
);

const getPlagiarisms = lruMemoize(assignmentSolutions =>
  assignmentSolutions
    .toArray()
    .map(getJsData)
    .filter(solution => solution && solution.plagiarism)
);

const getPlagiarismUniqueAuthors = lruMemoize(plagiarisms => unique(plagiarisms.map(({ authorId }) => authorId)));

const localStorageStateKey = 'AssignmentSolutions.state';

class AssignmentSolutions extends Component {
  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId))
        .then(res => res.value)
        .then(assignment =>
          dispatch(fetchGroupIfNeeded(assignment.groupId)).then(({ value: group }) =>
            dispatch(fetchByIds(safeGet(group, ['privateData', 'students']) || []))
          )
        ),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchAssignmentSolversIfNeeded({ assignmentId })),
      dispatch(fetchAssignmentSolutions(assignmentId)),
    ]);

  state = {
    viewMode: VIEW_MODE_DEFAULT,
    assignmentDialogOpen: false,
    closingReviews: false,
    closingReviewsFailed: false,
  };

  viewModeSelectHandler = viewMode => {
    this.setState({ viewMode });
    storageSetItem(localStorageStateKey, { viewMode });
  };

  openDialog = () => this.setState({ assignmentDialogOpen: true });
  closeDialog = () => this.setState({ assignmentDialogOpen: false });

  componentDidMount() {
    this.props.loadAsync();
    this.setState(storageGetItem(localStorageStateKey, null));
  }

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
    const safeName = toPlainAscii(name);
    return `${safeName || assignmentId}.zip`;
  };

  closeReviews = solutions => {
    this.setState({ closingReviews: true, closingReviewsFailed: false });
    return Promise.all(solutions.map(({ id }) => this.props.closeReview(id))).then(
      () => this.setState({ closingReviews: false }),
      () => this.setState({ closingReviews: false, closingReviewsFailed: true })
    );
  };

  openLinkGenerator = ({ actionButtons: { id, permissionHints } }) => {
    const {
      assignmentId,
      links: { SOLUTION_DETAIL_URI_FACTORY },
    } = this.props;
    return permissionHints && permissionHints.viewDetail ? SOLUTION_DETAIL_URI_FACTORY(assignmentId, id) : null;
  };

  // Re-format the data, so they can be rendered by the SortableTable ...
  render() {
    const {
      loggedUserId,
      currentUser,
      assignmentId,
      assignment,
      getStudents,
      getGroup,
      groupsAccessor,
      getUserSolutions,
      runtimeEnvironments,
      assignmentSolutions,
      downloadBestSolutionsArchive,
      fetchManyStatus,
      assignmentSolversLoading,
      assignmentSolverSelector,
      assignmentSolvers,
      intl: { locale },
      links,
    } = this.props;

    const pendingReviews = getPendingReviewSolutions(assignmentSolutions);
    const plagiarisms = getPlagiarisms(assignmentSolutions);

    return (
      <Page
        resource={assignment}
        icon={<ResultsIcon />}
        title={
          <FormattedMessage id="app.assignmentSolutions.title" defaultMessage="All Submissions of The Assignment" />
        }>
        {assignment =>
          hasPermissions(assignment, 'viewAssignmentSolutions') ? (
            <div>
              <AssignmentNavigation
                assignmentId={assignment.id}
                groupId={assignment.groupId}
                exerciseId={assignment.exerciseId}
                canEdit={hasPermissions(assignment, 'update')}
                canViewSolutions={true}
                canViewExercise={true}
              />

              <ResourceRenderer resource={[getGroup(assignment.groupId), currentUser]}>
                {(group, currentUser) => (
                  <>
                    {group.privateData && <GroupExamPending {...group} currentUser={currentUser} />}

                    <GroupArchivedWarning
                      {...group}
                      groupsDataAccessor={groupsAccessor}
                      linkFactory={links.GROUP_EDIT_URI_FACTORY}
                    />

                    <FetchManyResourceRenderer fetchManyStatus={fetchManyStatus} loading={null} failed={null}>
                      {() =>
                        plagiarisms && plagiarisms.length > 0 ? (
                          <Callout variant="danger" icon={<PlagiarismIcon />}>
                            <FormattedMessage
                              id="app.assignmentSolutions.plagiarismsDetected.authors"
                              defaultMessage="There {count, plural, one {is} other {are}} {count} {count, plural, one {solution} other {solutions}} (from {authors} {authors, plural, one {author} other {unique authors}}) with detected similarities. Such solutions may be plagiarisms."
                              values={{
                                count: plagiarisms.length,
                                authors: getPlagiarismUniqueAuthors(plagiarisms).length,
                              }}
                            />
                            {assignment.plagiarismCheckedAt && (
                              <>
                                <br />
                                <FormattedMessage
                                  id="app.assignmentSolutions.plagiarismsDetected.time"
                                  defaultMessage="The latest plagiarism check ended at {date}."
                                  values={{
                                    date: <DateTime unixTs={assignment.plagiarismCheckedAt} compact />,
                                  }}
                                />
                              </>
                            )}
                          </Callout>
                        ) : (
                          assignment.plagiarismCheckedAt && (
                            <Callout variant="success" icon={<PlagiarismCheckedIcon />}>
                              <FormattedMessage
                                id="app.assignmentSolutions.plagiarismsChecked"
                                defaultMessage="These assignment solutions were checked for plagiarisms at {date}. No similarities found."
                                values={{
                                  date: <DateTime unixTs={assignment.plagiarismCheckedAt} compact />,
                                }}
                              />
                            </Callout>
                          )
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
                                id="app.assignmentSolutions.pendingReviews"
                                defaultMessage="There {count, plural, one {is} other {are}} {count} pending {count, plural, one {review} other {reviews}} among the solutions of the selected assignment. Remember that the review comments are visible to the author after a review is closed."
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
                  </>
                )}
              </ResourceRenderer>

              <Row>
                <Col sm={12} md>
                  <TheButtonGroup className="mb-3 text-nowrap">
                    <a href="#" onClick={downloadBestSolutionsArchive(this.getArchiveFileName(assignment))}>
                      <Button variant="primary">
                        <DownloadIcon gapRight={2} />
                        <FormattedMessage
                          id="app.assignment.downloadBestSolutionsArchive"
                          defaultMessage="Download Bests"
                        />
                      </Button>
                    </a>

                    {hasPermissions(assignment, 'resubmitSubmissions') && (
                      <ResubmitAllSolutionsContainer assignmentId={assignment.id} />
                    )}

                    <Button variant="info" onClick={this.openDialog}>
                      <ChatIcon gapRight={2} />
                      <FormattedMessage id="generic.discussion" defaultMessage="Discussion" />
                    </Button>
                  </TheButtonGroup>

                  <Modal show={this.state.assignmentDialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
                    <CommentThreadContainer
                      threadId={assignment.id}
                      title={
                        <>
                          <FormattedMessage
                            id="app.assignments.discussionModalTitle"
                            defaultMessage="Public Discussion"
                          />
                          : <LocalizedExerciseName entity={{ name: '??', localizedTexts: assignment.localizedTexts }} />
                        </>
                      }
                      additionalPublicSwitchNote={
                        <FormattedMessage
                          id="app.assignments.discussionModal.additionalSwitchNote"
                          defaultMessage="(supervisors and students of this group)"
                        />
                      }
                      displayAs="modal"
                    />
                  </Modal>
                </Col>

                <Col sm={false} md="auto" className="text-nowrap pt-2 mb-3">
                  <DropdownButton
                    align="end"
                    title={
                      <>
                        <Icon icon="binoculars" gapRight={2} />
                        {viewModes[this.state.viewMode] || ''}
                      </>
                    }
                    className="shadow"
                    id="viewModeDropdown"
                    onSelect={this.viewModeSelectHandler}>
                    <Dropdown.Header>
                      <FormattedMessage
                        id="app.assignmentSolutions.viewModesTitle"
                        defaultMessage="Select solutions view filter"
                      />
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    {Object.keys(viewModes).map(viewMode => (
                      <Dropdown.Item key={viewMode} eventKey={viewMode} active={viewMode === this.state.viewMode}>
                        {viewModes[viewMode]}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </Col>
              </Row>

              <ResourceRenderer resource={[getGroup(assignment.groupId), ...runtimeEnvironments]}>
                {(group, ...runtimes) => (
                  <FetchManyResourceRenderer
                    fetchManyStatus={fetchManyStatus}
                    loading={<LoadingSolutionsTable />}
                    failed={<FailedLoadingSolutionsTable />}>
                    {() =>
                      this.state.viewMode === VIEW_MODE_GROUPED ? (
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
                                  <Box
                                    title={
                                      <>
                                        <UserIcon gapRight={2} className="text-body-secondary" />
                                        {user.fullName}
                                        <small className="ms-3 text-nowrap">
                                          (
                                          <Link to={links.GROUP_USER_SOLUTIONS_URI_FACTORY(group.id, user.id)}>
                                            <FormattedMessage
                                              id="app.assignmentSolutions.allUserSolutions"
                                              defaultMessage="all user solutions"
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
                                      solutions={getUserSolutions(user.id)}
                                      assignmentId={assignmentId}
                                      groupId={assignment.groupId}
                                      runtimeEnvironments={runtimes}
                                      noteMaxLength={160}
                                      assignmentSolversLoading={assignmentSolversLoading}
                                      assignmentSolver={assignmentSolverSelector(assignmentId, user.id)}
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
                              id="app.assignmentSolutions.assignmentSolutions"
                              defaultMessage="Assignment Solutions"
                            />
                          }
                          unlimitedHeight
                          noPadding>
                          <SortableTable
                            id={`AssignmentSolutions.${this.state.viewMode}`}
                            hover
                            columns={prepareTableColumnDescriptors(
                              loggedUserId,
                              assignmentId,
                              group.id,
                              this.state.viewMode,
                              locale,
                              links
                            )}
                            defaultOrder="date"
                            data={prepareTableData(
                              assignmentSolutions,
                              getStudents(group.id),
                              assignmentSolversLoading ? null : assignmentSolvers,
                              runtimes,
                              this.state.viewMode
                            )}
                            openLinkGenerator={this.openLinkGenerator}
                            empty={
                              <div className="text-center text-body-secondary">
                                <FormattedMessage
                                  id="app.assignmentSolutions.noSolutions"
                                  defaultMessage="There are currently no submitted solutions."
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

AssignmentSolutions.propTypes = {
  loggedUserId: PropTypes.string.isRequired,
  currentUser: ImmutablePropTypes.map,
  assignmentId: PropTypes.string.isRequired,
  assignment: PropTypes.object,
  getStudents: PropTypes.func.isRequired,
  getGroup: PropTypes.func.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
  getUserSolutions: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.array,
  assignmentSolutions: ImmutablePropTypes.list,
  loadAsync: PropTypes.func.isRequired,
  downloadBestSolutionsArchive: PropTypes.func.isRequired,
  fetchManyStatus: PropTypes.string,
  assignmentSolversLoading: PropTypes.bool,
  assignmentSolverSelector: PropTypes.func.isRequired,
  assignmentSolvers: ImmutablePropTypes.map,
  closeReview: PropTypes.func.isRequired,
  intl: PropTypes.object,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    (state, { params: { assignmentId } }) => {
      const assignment = getAssignment(state, assignmentId);
      const getStudentsIds = groupId => studentsIdsOfGroup(groupId)(state);
      const readyUsers = usersSelector(state)
        .toArray()
        .map(([_, val]) => val) // users are map, get rid of keys
        .filter(isReady);

      return {
        loggedUserId: loggedInUserIdSelector(state),
        currentUser: loggedInUserSelector(state),
        assignmentId,
        assignment,
        getStudentsIds,
        getStudents: groupId => readyUsers.filter(user => getStudentsIds(groupId).includes(getId(user))).map(getJsData),
        getUserSolutions: userId => getUserSolutionsSortedData(state)(userId, assignmentId),
        assignmentSolutions: getAssignmentSolutions(state, assignmentId),
        getGroup: id => groupSelector(state, id),
        groupsAccessor: groupDataAccessorSelector(state),
        runtimeEnvironments: getAssignmentEnvironments(state, assignmentId),
        fetchManyStatus: fetchManyAssignmentSolutionsStatus(assignmentId)(state),
        assignmentSolversLoading: isAssignmentSolversLoading(state),
        assignmentSolverSelector: getAssignmentSolverSelector(state),
        assignmentSolvers: getOneAssignmentSolvers(state, assignmentId),
      };
    },
    (dispatch, { params: { assignmentId } }) => ({
      loadAsync: () => AssignmentSolutions.loadAsync({ assignmentId }, dispatch),
      downloadBestSolutionsArchive: name => ev => {
        ev.preventDefault();
        dispatch(downloadBestSolutionsArchive(assignmentId, name));
      },
      closeReview: id => dispatch(setSolutionReviewState(id, true)),
    })
  )(injectIntl(AssignmentSolutions))
);
