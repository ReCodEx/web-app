import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Modal, Tabs, Tab, Table } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';
import { withRouter } from 'react-router';

import Page from '../../components/layout/Page';
import InsetPanel from '../../components/widgets/InsetPanel';
import { AssignmentSolutionNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import {
  CircleIcon,
  CodeCompareIcon,
  PlagiarismIcon,
  RefreshIcon,
  SolutionResultsIcon,
  StopIcon,
  SwapIcon,
} from '../../components/icons';
import SolutionActionsContainer from '../../containers/SolutionActionsContainer';
import SourceCodeBox from '../../components/Solutions/SourceCodeBox';
import ReviewSummary from '../../components/Solutions/ReviewSummary';
import RecentlyVisited from '../../components/Solutions/RecentlyVisited';
import { registerSolutionVisit } from '../../components/Solutions/RecentlyVisited/functions';
import Callout from '../../components/widgets/Callout';

import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchSolutionIfNeeded, fetchUsersSolutions } from '../../redux/modules/solutions';
import { fetchAssignmentSolutionFilesIfNeeded } from '../../redux/modules/solutionFiles';
import {
  fetchSolutionReviewIfNeeded,
  addComment,
  updateComment,
  removeComment,
} from '../../redux/modules/solutionReviews';
import { download } from '../../redux/modules/files';
import { fetchContentIfNeeded } from '../../redux/modules/filesContent';
import { getSolution } from '../../redux/selectors/solutions';
import { getSolutionFiles } from '../../redux/selectors/solutionFiles';
import { getSolutionReviewComments } from '../../redux/selectors/solutionReviews';
import {
  getAssignment,
  getUserSolutionsSortedData,
  assignmentEnvironmentsSelector,
} from '../../redux/selectors/assignments';
import { getFilesContentSelector } from '../../redux/selectors/files';
import { getLoggedInUserEffectiveRole } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { loggedUserIsPrimaryAdminOfSelector } from '../../redux/selectors/usersGroups';

import { storageGetItem, storageSetItem, storageRemoveItem } from '../../helpers/localStorage';
import withLinks from '../../helpers/withLinks';
import { isSupervisorRole } from '../../components/helpers/usersRoles';
import { hasPermissions, isEmptyObject, EMPTY_ARRAY } from '../../helpers/common';
import { preprocessFiles, associateFilesForDiff, getRevertedMapping, groupReviewCommentPerFile } from './functions';

const fileNameAndEntry = file => [file.parentId || file.id, file.entryName || null];

const wrapInArray = defaultMemoize(entry => [entry]);

const localStorageDiffMappingsKey = 'SolutionSourceCodes.diffMappings.';

class SolutionSourceCodes extends Component {
  state = { diffDialogOpen: false, mappingDialogOpenFile: null, mappingDialogDiffWith: null, diffMappings: {} };

  static loadAsync = ({ solutionId, assignmentId, secondSolutionId }, dispatch) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      secondSolutionId
        ? dispatch(fetchSolutionIfNeeded(secondSolutionId)).then(res => {
            registerSolutionVisit(res.value);
            return res.value.assignmentId !== assignmentId
              ? dispatch(fetchAssignmentIfNeeded(res.value.assignmentId))
              : Promise.resolve();
          })
        : Promise.resolve(),
      dispatch(fetchSolutionIfNeeded(solutionId))
        .then(res => res.value)
        .then(solution => {
          registerSolutionVisit(solution);
          return Promise.all([dispatch(fetchUsersSolutions(solution.authorId, assignmentId))]);
        }),
      dispatch(fetchSolutionReviewIfNeeded(solutionId)),
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchAssignmentSolutionFilesIfNeeded(solutionId))
        .then(res => preprocessFiles(res.value))
        .then(files => Promise.all(files.map(file => dispatch(fetchContentIfNeeded(...fileNameAndEntry(file)))))),
      secondSolutionId && secondSolutionId !== solutionId
        ? dispatch(fetchAssignmentSolutionFilesIfNeeded(secondSolutionId))
            .then(res => preprocessFiles(res.value))
            .then(files => Promise.all(files.map(file => dispatch(fetchContentIfNeeded(...fileNameAndEntry(file))))))
        : Promise.resolve(),
    ]);

  getDiffMappingsLocalStorageKey = () => {
    const {
      match: {
        params: { solutionId, secondSolutionId },
      },
    } = this.props;

    return secondSolutionId ? `${localStorageDiffMappingsKey}${solutionId}/${secondSolutionId}` : null;
  };

  componentDidMount = () => {
    this.props.loadAsync();

    const lsKey = this.getDiffMappingsLocalStorageKey();
    if (lsKey) {
      this.setState({
        diffMappings: storageGetItem(lsKey, {}),
      });
    }
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.match.params.solutionId !== prevProps.match.params.solutionId ||
      this.props.match.params.secondSolutionId !== prevProps.match.params.secondSolutionId
    ) {
      this.props.loadAsync();

      const lsKey = this.getDiffMappingsLocalStorageKey();
      if (lsKey) {
        this.setState({
          diffMappings: storageGetItem(lsKey, {}),
        });
      }
    }
  }

  openDiffDialog = () => {
    this.setState({ diffDialogOpen: true });
  };

  openMappingDialog = (mappingDialogOpenFile, mappingDialogDiffWith) => {
    this.setState({ mappingDialogOpenFile, mappingDialogDiffWith });
  };

  closeDialogs = () => {
    this.setState({ diffDialogOpen: false, mappingDialogOpenFile: null, mappingDialogDiffWith: null });
  };

  selectDiffSolution = id => {
    const {
      match: {
        params: { assignmentId, solutionId, secondSolutionId },
      },
      history: { replace },
      links: { SOLUTION_SOURCE_CODES_URI_FACTORY, SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY },
    } = this.props;
    this.closeDialogs();
    if (id !== secondSolutionId && (id || secondSolutionId))
      replace(
        id
          ? SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY(assignmentId, solutionId, id)
          : SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, solutionId)
      );
  };

  swapSolutions = () => {
    const {
      secondSolution,
      match: {
        params: { solutionId, secondSolutionId },
      },
      history: { replace },
      links: { SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY },
    } = this.props;

    const assignmentId = secondSolution && secondSolution.getIn(['data', 'assignmentId']);
    if (secondSolutionId && assignmentId && solutionId !== secondSolutionId) {
      replace(SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY(assignmentId, secondSolutionId, solutionId));
    }
  };

  adjustDiffMapping = (firstId, secondId = null) => {
    this.closeDialogs();
    const diffMappings = Object.fromEntries(
      Object.entries(this.state.diffMappings).filter(([key, value]) => key !== firstId && value !== secondId)
    );
    if (secondId) {
      diffMappings[firstId] = secondId;
    }
    this.setState({ diffMappings });
    const lsKey = this.getDiffMappingsLocalStorageKey();
    if (lsKey) {
      storageSetItem(lsKey, diffMappings);
    }
  };

  resetDiffMappings = () => {
    this.closeDialogs();
    this.setState({ diffMappings: {} });
    const lsKey = this.getDiffMappingsLocalStorageKey();
    if (lsKey) {
      storageRemoveItem(lsKey);
    }
  };

  render() {
    const {
      assignment,
      secondAssignment,
      solution,
      secondSolution,
      files,
      secondFiles,
      reviewComments,
      fileContentsSelector,
      download,
      userSolutionsSelector,
      loggedUserId,
      effectiveRole,
      runtimeEnvironments,
      isPrimaryAdminOf,
      addComment,
      updateComment,
      removeComment,
      match: {
        params: { solutionId, assignmentId, secondSolutionId },
      },
    } = this.props;

    const diffMode =
      secondSolutionId && secondSolutionId !== solutionId && secondSolution && isSupervisorRole(effectiveRole);
    const resources = diffMode ? [solution, assignment, secondSolution, secondAssignment] : [solution, assignment];

    return (
      <Page
        resource={resources}
        icon={<SolutionResultsIcon />}
        title={
          diffMode ? (
            <FormattedMessage
              id="app.solutionSourceCodes.titleDiff"
              defaultMessage="Comparing Source Codes of Two Solutions"
            />
          ) : (
            <FormattedMessage id="app.solutionSourceCodes.title" defaultMessage="Solution Source Code Files Overview" />
          )
        }>
        {(solution, assignment, secondSolution = null, secondAssignment = null) => (
          <div>
            <AssignmentSolutionNavigation
              solutionId={solution.id}
              assignmentId={assignmentId}
              exerciseId={assignment.exerciseId}
              userId={solution.authorId}
              groupId={assignment.groupId}
              attemptIndex={solution.attemptIndex}
              plagiarism={Boolean(solution.plagiarism) && hasPermissions(solution, 'viewDetectedPlagiarisms')}
              canViewSolutions={hasPermissions(assignment, 'viewAssignmentSolutions')}
              canViewExercise={
                hasPermissions(
                  assignment,
                  'viewAssignmentSolutions'
                ) /* this is not the actual permission, but close enough */
              }
              canViewUserProfile={hasPermissions(assignment, 'viewAssignmentSolutions')}
              titlePrefix={
                diffMode ? (
                  <span className="text-muted mr-2 small">
                    <FormattedMessage id="app.solutionSourceCodes.left" defaultMessage="Left side" />:
                  </span>
                ) : null
              }
            />

            {diffMode && (
              <>
                <h4 className="text-muted text-center my-2">
                  <FormattedMessage
                    id="app.solutionSourceCodes.isBeingComparedWith"
                    defaultMessage="... is being compared with ..."
                  />

                  <SwapIcon largeGapLeft className="text-primary" timid onClick={this.swapSolutions} />
                </h4>

                <AssignmentSolutionNavigation
                  solutionId={secondSolution.id}
                  assignmentId={secondSolution.assignmentId}
                  exerciseId={secondAssignment.exerciseId}
                  userId={secondSolution.authorId}
                  groupId={secondAssignment.groupId}
                  attemptIndex={secondSolution.attemptIndex}
                  plagiarism={
                    Boolean(secondSolution.plagiarism) && hasPermissions(secondSolution, 'viewDetectedPlagiarisms')
                  }
                  canViewSolutions={hasPermissions(secondAssignment, 'viewAssignmentSolutions')}
                  canViewExercise={
                    hasPermissions(
                      secondAssignment,
                      'viewAssignmentSolutions'
                    ) /* this is not the actual permission, but close enough */
                  }
                  canViewUserProfile={hasPermissions(secondAssignment, 'viewAssignmentSolutions')}
                  titlePrefix={
                    <span className="text-muted mr-2 small">
                      <FormattedMessage id="app.solutionSourceCodes.right" defaultMessage="Right side" />:
                    </span>
                  }
                />
              </>
            )}

            {isSupervisorRole(effectiveRole) && (
              <>
                {solution.plagiarism && hasPermissions(solution, 'viewDetectedPlagiarisms') && (
                  <Callout variant="warning" icon={<PlagiarismIcon />}>
                    <FormattedMessage
                      id="app.solution.suspectedPlagiarismWarning"
                      defaultMessage="Similar solutions have been detected, the solution is suspected of being a plagiarism. Details can be found on 'Similarities' page."
                    />
                  </Callout>
                )}

                <Row className="justify-content-sm-between">
                  <Col sm="auto" className="mb-3">
                    {!diffMode && (
                      <TheButtonGroup className="ml-2 text-nowrap">
                        <SolutionActionsContainer id={solution.id} showAllButtons />
                      </TheButtonGroup>
                    )}
                  </Col>

                  <Col sm="auto" className="mb-3">
                    <TheButtonGroup>
                      <Button variant="primary" onClick={this.openDiffDialog}>
                        <CodeCompareIcon gapRight />
                        {diffMode ? (
                          <FormattedMessage
                            id="app.solutionSourceCodes.diffButtonChange"
                            defaultMessage="Compare with another..."
                          />
                        ) : (
                          <FormattedMessage id="app.solutionSourceCodes.diffButton" defaultMessage="Compare with..." />
                        )}
                      </Button>

                      {diffMode && (
                        <Button variant="danger" onClick={() => this.selectDiffSolution(null)}>
                          <StopIcon gapRight />
                          <FormattedMessage
                            id="app.solutionSourceCodes.cancelDiffButton"
                            defaultMessage="Compare mode off"
                          />
                        </Button>
                      )}
                    </TheButtonGroup>
                  </Col>
                </Row>

                {!diffMode && (
                  <>
                    {(!solution.review || !solution.review.startedAt) && (
                      <InsetPanel>
                        <FormattedMessage
                          id="app.solutionSourceCodes.codeReviewsAbout"
                          defaultMessage="You may create a code review here and assign comments directly to individual lines of code. When a review is started, you can add comments by double-clicking the associated line of code. The comments will become visible to the author when the review is closed. The reviews are not visible when the compare mode is active."
                        />
                      </InsetPanel>
                    )}

                    {solution.review && solution.review.startedAt && !solution.review.closedAt && (
                      <Callout variant="info">
                        <p className="mb-2">
                          <FormattedMessage
                            id="app.solutionSourceCodes.reviewPendingAbout"
                            defaultMessage="A review is currently open. You may add comments in the code by double-clicking on the associated line."
                          />
                        </p>
                        <p>
                          <FormattedMessage
                            id="app.solutionSourceCodes.reviewPendingNeedsClosing"
                            defaultMessage="Please note that the comments in the code are not visible to the author until you close the review. A notification mail will be sent to the author when you close it."
                          />
                        </p>
                      </Callout>
                    )}

                    {solution.review && solution.review.closedAt && (
                      <Callout variant="success">
                        <FormattedMessage
                          id="app.solutionSourceCodes.reviewClosedInfo"
                          defaultMessage="The review comments are now visible to the author. You may still edit the review, but each modification will be sent as an email notification to the author. If you wish to make more significant changes, re-open the review, make the modifications, and close it again."
                        />
                      </Callout>
                    )}
                  </>
                )}
              </>
            )}

            {loggedUserId === solution.authorId && (
              <>
                {solution.review && solution.review.closedAt && (
                  <Callout variant={solution.review.issues > 0 ? 'warning' : 'success'}>
                    {solution.review.issues > 0 ? (
                      <FormattedMessage
                        id="app.solutionSourceCodes.reviewClosedAuthorInfoWithIssues"
                        defaultMessage="Your solution was reviewed. You have {issues} {issues, plural, one {issue} other {issues}} to fix."
                        values={{ issues: solution.review.issues }}
                      />
                    ) : (
                      <FormattedMessage
                        id="app.solutionSourceCodes.reviewClosedAuthorInfoNoIssues"
                        defaultMessage="Your solution was reviewed and no issues were reported."
                      />
                    )}
                  </Callout>
                )}
              </>
            )}

            <ResourceRenderer resource={reviewComments} bulkyLoading>
              {reviewCommentsRaw => (
                <ResourceRenderer resource={files} bulkyLoading>
                  {filesRaw => (
                    <ResourceRenderer resource={secondFiles || []} bulkyLoading>
                      {(secondFilesRaw = null) => {
                        const secondFiles = secondFilesRaw && preprocessFiles(secondFilesRaw);
                        const files = associateFilesForDiff(
                          preprocessFiles(filesRaw),
                          secondFiles,
                          this.state.diffMappings
                        );
                        const revertedIndex = files && secondFiles && getRevertedMapping(files);
                        const groupedReviewComments =
                          !diffMode && hasPermissions(solution, 'viewReview')
                            ? groupReviewCommentPerFile(
                                files,
                                reviewCommentsRaw,
                                solution.review && solution.review.closedAt,
                                isSupervisorRole(effectiveRole)
                              )
                            : {};
                        const canUpdateComments =
                          !diffMode &&
                          hasPermissions(solution, 'review') &&
                          solution.review &&
                          solution.review.startedAt;

                        return (
                          <>
                            {((groupedReviewComments && (groupedReviewComments[''] || EMPTY_ARRAY).length > 0) ||
                              canUpdateComments) && (
                              <ReviewSummary
                                reviewComments={groupedReviewComments[''] || EMPTY_ARRAY}
                                reviewClosed={Boolean(solution.review && solution.review.closedAt)}
                                authorView={solution.authorId === loggedUserId}
                                restrictCommentAuthor={isPrimaryAdminOf(assignment.groupId) ? null : loggedUserId}
                                addComment={
                                  canUpdateComments && hasPermissions(solution, 'addReviewComment') ? addComment : null
                                }
                                updateComment={
                                  canUpdateComments && hasPermissions(solution, 'review') ? updateComment : null
                                }
                                removeComment={
                                  canUpdateComments && hasPermissions(solution, 'review') ? removeComment : null
                                }
                              />
                            )}

                            {files.map(file => (
                              <SourceCodeBox
                                key={file.id}
                                {...file}
                                solutionId={solution.id}
                                download={download}
                                fileContentsSelector={fileContentsSelector}
                                diffMode={diffMode}
                                adjustDiffMapping={this.openMappingDialog}
                                authorView={solution.authorId === loggedUserId}
                                restrictCommentAuthor={isPrimaryAdminOf(assignment.groupId) ? null : loggedUserId}
                                reviewClosed={Boolean(solution.review && solution.review.closedAt)}
                                reviewComments={
                                  !diffMode && hasPermissions(solution, 'viewReview')
                                    ? groupedReviewComments[file.name]
                                    : null
                                }
                                addComment={
                                  canUpdateComments && hasPermissions(solution, 'addReviewComment') ? addComment : null
                                }
                                updateComment={
                                  canUpdateComments && hasPermissions(solution, 'review') ? updateComment : null
                                }
                                removeComment={
                                  canUpdateComments && hasPermissions(solution, 'review') ? removeComment : null
                                }
                              />
                            ))}

                            {diffMode && secondFiles && (
                              <Modal
                                show={this.state.mappingDialogOpenFile !== null}
                                backdrop="static"
                                onHide={this.closeDialogs}
                                size="xl">
                                <Modal.Header closeButton>
                                  <Modal.Title>
                                    <FormattedMessage
                                      id="app.solutionSourceCodes.mappingModal.title"
                                      defaultMessage="Adjust mapping of compared files"
                                    />
                                  </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                  <h5 className="mb-3">
                                    <code className="mr-2">
                                      {this.state.mappingDialogOpenFile && this.state.mappingDialogOpenFile.name}
                                    </code>{' '}
                                    <FormattedMessage
                                      id="app.solutionSourceCodes.mappingModal.fileIsAssociatedWith"
                                      defaultMessage="file (on the left) is associated with..."
                                    />
                                  </h5>

                                  <InsetPanel>
                                    {this.state.mappingDialogOpenFile && (
                                      <FormattedMessage
                                        id="app.solutionSourceCodes.mappingModal.explain"
                                        defaultMessage="Select a file from second solution that will be compared with ''<code>{name}</code>'' file from the first solution. Note that changing a mapping between two files may affect how other files are mapped."
                                        values={{
                                          name: this.state.mappingDialogOpenFile.name,
                                          code: content => <code>{content}</code>,
                                        }}
                                      />
                                    )}
                                  </InsetPanel>

                                  <Table hover>
                                    <tbody>
                                      {secondFiles.map(file => {
                                        const selected =
                                          this.state.mappingDialogDiffWith &&
                                          file.id === this.state.mappingDialogDiffWith.id;
                                        return (
                                          <tr
                                            key={file.id}
                                            className={selected ? 'table-primary' : ''}
                                            onClick={
                                              selected
                                                ? null
                                                : () =>
                                                    this.adjustDiffMapping(this.state.mappingDialogOpenFile.id, file.id)
                                            }>
                                            <td className="shrink-col">
                                              <CircleIcon selected={selected} />
                                            </td>
                                            <td>{file.name}</td>
                                            <td className="shrink-col text-muted text-nowrap small">
                                              {revertedIndex && revertedIndex[file.id] && (
                                                <>
                                                  <CodeCompareIcon gapRight />
                                                  {revertedIndex[file.id].name}
                                                </>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </Table>

                                  {this.state.diffMappings && !isEmptyObject(this.state.diffMappings) && (
                                    <div className="text-center">
                                      <Button variant="danger" onClick={this.resetDiffMappings}>
                                        <RefreshIcon gapRight />
                                        <FormattedMessage
                                          id="app.solutionSourceCodes.mappingModal.resetButton"
                                          defaultMessage="Reset mapping"
                                        />
                                      </Button>
                                    </div>
                                  )}
                                </Modal.Body>
                              </Modal>
                            )}
                          </>
                        );
                      }}
                    </ResourceRenderer>
                  )}
                </ResourceRenderer>
              )}
            </ResourceRenderer>

            <Modal show={this.state.diffDialogOpen} backdrop="static" onHide={this.closeDialogs} size="xl">
              <Modal.Header closeButton>
                <Modal.Title>
                  <FormattedMessage
                    id="app.solutionSourceCodes.diffModal.title"
                    defaultMessage="Compare two solutions and display differences"
                  />
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <InsetPanel>
                  <FormattedMessage
                    id="app.solutionSourceCodes.diffModal.explain"
                    defaultMessage="When second solution is selected for comparison from the table below, the differences of the corresponding files will be displayed in a two-column views. The current solution will be displayed on the left, the second solution on the right."
                  />
                </InsetPanel>
                <Tabs defaultActiveKey="user-solutions" id="solution-sources-modal-tabs">
                  <Tab
                    eventKey="user-solutions"
                    title={
                      <FormattedMessage
                        id="app.solutionSourceCodes.diffModal.tabUserSolutions"
                        defaultMessage="User solutions"
                      />
                    }>
                    <ResourceRenderer resource={runtimeEnvironments} returnAsArray>
                      {runtimes => (
                        <SolutionsTable
                          solutions={userSolutionsSelector(solution.authorId, assignmentId)}
                          assignmentId={assignmentId}
                          groupId={assignment.groupId}
                          runtimeEnvironments={runtimes}
                          noteMaxlen={32}
                          selected={solution.id}
                          highlights={secondSolutionId ? wrapInArray(secondSolutionId) : EMPTY_ARRAY}
                          showActionButtons={false}
                          onSelect={this.selectDiffSolution}
                        />
                      )}
                    </ResourceRenderer>
                  </Tab>
                  <Tab
                    eventKey="recently-visited"
                    title={
                      <FormattedMessage
                        id="app.solutionSourceCodes.diffModal.tabRecentSolutions"
                        defaultMessage="Recently visited"
                      />
                    }>
                    <RecentlyVisited
                      selectedId={solutionId}
                      secondSelectedId={secondSolutionId}
                      onSelect={this.selectDiffSolution}
                    />
                  </Tab>
                </Tabs>
              </Modal.Body>
            </Modal>
          </div>
        )}
      </Page>
    );
  }
}

SolutionSourceCodes.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      assignmentId: PropTypes.string.isRequired,
      solutionId: PropTypes.string.isRequired,
      secondSolutionId: PropTypes.string,
    }).isRequired,
  }).isRequired,
  assignment: ImmutablePropTypes.map,
  secondAssignment: ImmutablePropTypes.map,
  loggedUserId: PropTypes.string,
  effectiveRole: PropTypes.string,
  runtimeEnvironments: PropTypes.array,
  isPrimaryAdminOf: PropTypes.func.isRequired,
  children: PropTypes.element,
  solution: ImmutablePropTypes.map,
  secondSolution: ImmutablePropTypes.map,
  files: ImmutablePropTypes.map,
  reviewComments: ImmutablePropTypes.map,
  secondFiles: ImmutablePropTypes.map,
  fileContentsSelector: PropTypes.func.isRequired,
  userSolutionsSelector: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  addComment: PropTypes.func.isRequired,
  updateComment: PropTypes.func.isRequired,
  removeComment: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  links: PropTypes.object,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { solutionId, secondSolutionId, assignmentId },
        },
      }
    ) => {
      const secondSolution =
        secondSolutionId && secondSolutionId !== solutionId ? getSolution(state, secondSolutionId) : null;

      return {
        solution: getSolution(state, solutionId),
        secondSolution,
        files: getSolutionFiles(state, solutionId),
        reviewComments: getSolutionReviewComments(state, solutionId),
        secondFiles:
          secondSolutionId && secondSolutionId !== solutionId ? getSolutionFiles(state, secondSolutionId) : null,
        fileContentsSelector: getFilesContentSelector(state),
        userSolutionsSelector: getUserSolutionsSortedData(state),
        assignment: getAssignment(state)(assignmentId),
        secondAssignment:
          secondSolution && secondSolution.getIn(['data', 'assignmentId'])
            ? getAssignment(state)(secondSolution.getIn(['data', 'assignmentId']))
            : null,
        loggedUserId: loggedInUserIdSelector(state),
        effectiveRole: getLoggedInUserEffectiveRole(state),
        runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId),
        isPrimaryAdminOf: loggedUserIsPrimaryAdminOfSelector(state),
      };
    },
    (dispatch, { match: { params } }) => ({
      loadAsync: () => SolutionSourceCodes.loadAsync(params, dispatch),
      download: (id, entry = null) => dispatch(download(id, entry)),
      addComment: comment => dispatch(addComment(params.solutionId, comment)),
      updateComment: comment => dispatch(updateComment(params.solutionId, comment)),
      removeComment: id => dispatch(removeComment(params.solutionId, id)),
    })
  )(withRouter(SolutionSourceCodes))
);
