import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { AssignmentSolutionNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SolutionDetail, { FailedSubmissionDetail } from '../../components/Solutions/SolutionDetail';
import SolutionActionsContainer from '../../containers/SolutionActionsContainer';
import ResubmitSolutionContainer from '../../containers/ResubmitSolutionContainer';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { TheButtonGroup } from '../../components/widgets/TheButton';
import Callout from '../../components/widgets/Callout';
import SubmitSolutionButton from '../../components/Assignments/SubmitSolutionButton';

import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import {
  fetchSolution,
  fetchSolutionIfNeeded,
  fetchUsersSolutions,
  setNote,
  fetchAssignmentSolversIfNeeded,
} from '../../redux/modules/solutions';
import { fetchAssignmentSolutionFilesIfNeeded } from '../../redux/modules/solutionFiles';
import { download } from '../../redux/modules/files';
import {
  fetchSubmissionEvaluationsForSolution,
  deleteSubmissionEvaluation,
} from '../../redux/modules/submissionEvaluations';
import { fetchAssignmentSubmissionScoreConfigIfNeeded } from '../../redux/modules/exerciseScoreConfig';
import {
  init,
  submitAssignmentSolution as submitSolution,
  presubmitAssignmentSolution as presubmitSolution,
} from '../../redux/modules/submission';
import { canSubmit } from '../../redux/modules/canSubmit';

import { getSolution, isAssignmentSolversLoading, getAssignmentSolverSelector } from '../../redux/selectors/solutions';
import { getSolutionFiles } from '../../redux/selectors/solutionFiles';
import {
  getAssignment,
  assignmentEnvironmentsSelector,
  getUserSolutionsSortedData,
} from '../../redux/selectors/assignments';
import { evaluationsForSubmissionSelector, fetchManyStatus } from '../../redux/selectors/submissionEvaluations';
import { assignmentSubmissionScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig';
import { isLoggedAsStudent } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isSubmitting } from '../../redux/selectors/submission';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';

import { registerSolutionVisit } from '../../components/Solutions/RecentlyVisited/functions';
import { hasPermissions } from '../../helpers/common';
import { LinkIcon, PlagiarismIcon, SolutionResultsIcon, WarningIcon } from '../../components/icons';

import withLinks from '../../helpers/withLinks';

const assignmentHasRuntime = defaultMemoize(
  (assignment, runtimeId) =>
    assignment.runtimeEnvironmentIds.find(id => id === runtimeId) !== undefined &&
    assignment.disabledRuntimeEnvironmentIds.find(id => id === runtimeId) === undefined
);

class Solution extends Component {
  static loadAsync = ({ solutionId, assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchSolutionIfNeeded(solutionId))
        .then(res => res.value)
        .then(solution => {
          registerSolutionVisit(solution);
          return Promise.all([
            dispatch(fetchUsersSolutions(solution.authorId, assignmentId)),
            dispatch(fetchAssignmentSolversIfNeeded({ assignmentId, userId: solution.authorId })),
          ]);
        }),
      dispatch(fetchSubmissionEvaluationsForSolution(solutionId)),
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchAssignmentSolutionFilesIfNeeded(solutionId)),
      dispatch(canSubmit(assignmentId)),
    ]);

  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.solutionId !== prevProps.params.solutionId) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      assignment,
      solution,
      files,
      download,
      userSolutionsSelector,
      loggedInUserId,
      submitting,
      canSubmit,
      initCanSubmit,
      reloadCanSubmit,
      params: { assignmentId },
      evaluations,
      runtimeEnvironments,
      fetchStatus,
      editNote,
      deleteEvaluation,
      refreshSolutionEvaluations,
      scoreConfigSelector,
      fetchScoreConfigIfNeeded,
      assignmentSolversLoading,
      assignmentSolverSelector,
      isStudent = false,
      intl: { locale },
      links: { SOLUTION_SOURCE_CODES_URI_FACTORY },
    } = this.props;

    return (
      <Page
        resource={assignment}
        icon={<SolutionResultsIcon />}
        title={<FormattedMessage id="app.submission.evaluation.title" defaultMessage="Solution Detail" />}>
        <ResourceRenderer failed={<FailedSubmissionDetail />} resource={[solution, assignment]}>
          {(solution, assignment) => (
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
              />
              {solution.plagiarism && hasPermissions(solution, 'viewDetectedPlagiarisms') && (
                <Callout variant="warning" icon={<PlagiarismIcon />}>
                  <FormattedMessage
                    id="app.solution.suspectedPlagiarismWarning"
                    defaultMessage="Similar solutions have been detected, the solution is suspected of being a plagiarism. Details can be found on 'Similarities' page."
                  />
                </Callout>
              )}
              {(hasPermissions(solution, 'setFlag') ||
                hasPermissions(solution, 'review') ||
                hasPermissions(assignment, 'resubmitSubmissions')) && (
                <Row>
                  <Col className="mb-3" xs={12} lg={true}>
                    <TheButtonGroup>
                      <SolutionActionsContainer id={solution.id} />
                    </TheButtonGroup>
                  </Col>

                  <Col xs={12} lg="auto" className="mb-3">
                    <TheButtonGroup className="text-nowrap">
                      {hasPermissions(assignment, 'resubmitSubmissions') &&
                        assignmentHasRuntime(assignment, solution.runtimeEnvironmentId) && (
                          <>
                            <ResubmitSolutionContainer
                              id={solution.id}
                              assignmentId={assignment.id}
                              isDebug={false}
                              userId={solution.authorId}
                              locale={locale}
                            />
                            <ResubmitSolutionContainer
                              id={solution.id}
                              assignmentId={assignment.id}
                              isDebug={true}
                              userId={solution.authorId}
                              locale={locale}
                            />
                          </>
                        )}
                    </TheButtonGroup>

                    {hasPermissions(assignment, 'resubmitSubmissions') &&
                      !assignmentHasRuntime(assignment, solution.runtimeEnvironmentId) && (
                        <span>
                          <WarningIcon largeGapLeft gapRight className="text-warning" />
                          <FormattedMessage
                            id="app.solution.environmentNotAllowedCannotResubmit"
                            defaultMessage="The assignment no longer supports the environment for which this solution was evaluated. Resubmission is not possible."
                          />
                        </span>
                      )}
                  </Col>
                </Row>
              )}

              {isStudent && (
                <Row>
                  <Col xs={12} className="mb-3 text-right">
                    <ResourceRenderer loading={<SubmitSolutionButton disabled={true} />} resource={canSubmit}>
                      {canSubmitObj => (
                        <SubmitSolutionButton
                          onClick={initCanSubmit(assignment.id)}
                          disabled={!canSubmitObj.canSubmit}
                        />
                      )}
                    </ResourceRenderer>
                    <SubmitSolutionContainer
                      userId={loggedInUserId}
                      id={assignment.id}
                      onSubmit={submitSolution}
                      presubmitValidation={presubmitSolution}
                      afterEvaluationStarts={reloadCanSubmit}
                      onReset={initCanSubmit}
                      isOpen={submitting}
                      solutionFilesLimit={assignment.solutionFilesLimit}
                      solutionSizeLimit={assignment.solutionSizeLimit}
                    />
                  </Col>
                </Row>
              )}

              {hasPermissions(solution, 'review') &&
                solution.review &&
                solution.review.startedAt &&
                !solution.review.closedAt && (
                  <Callout variant="info">
                    <FormattedMessage
                      id="app.solution.reviewPendingAbout"
                      defaultMessage="The solution is currently under review. Please, do not forget to close the review when you are done since the author does not see the comments until the review is closed."
                    />
                  </Callout>
                )}
              {isStudent && hasPermissions(solution, 'viewReview') && solution.review && solution.review.closedAt && (
                <Callout variant={solution.review.issues > 0 ? 'warning' : 'success'}>
                  <FormattedMessage
                    id="app.solution.reviewAvailableCallout"
                    defaultMessage="A review of this solution is available on the submitted files page."
                  />
                  {solution.review.issues > 0 && (
                    <>
                      {' ('}
                      <FormattedMessage
                        id="app.solution.reviewIssuesCount"
                        defaultMessage="{issues} {issues, plural, one {issue} other {issues}} to resolve"
                        values={{ issues: solution.review.issues }}
                      />
                      {')'}
                    </>
                  )}
                  <Link to={SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, solution.id)}>
                    <LinkIcon largeGapLeft className="text-primary" />
                  </Link>
                </Callout>
              )}
              <ResourceRenderer resource={runtimeEnvironments} returnAsArray>
                {runtimes => (
                  <FetchManyResourceRenderer fetchManyStatus={fetchStatus}>
                    {() => (
                      <SolutionDetail
                        solution={solution}
                        files={files}
                        download={download}
                        otherSolutions={userSolutionsSelector(solution.authorId, assignment.id)}
                        assignmentSolversLoading={assignmentSolversLoading}
                        assignmentSolverSelector={assignmentSolverSelector}
                        assignment={assignment}
                        evaluations={evaluations}
                        runtimeEnvironments={runtimes}
                        deleteEvaluation={deleteEvaluation}
                        refreshSolutionEvaluations={refreshSolutionEvaluations}
                        editNote={hasPermissions(solution, 'update') ? editNote : null}
                        scoreConfigSelector={scoreConfigSelector}
                        fetchScoreConfigIfNeeded={fetchScoreConfigIfNeeded}
                        canResubmit={hasPermissions(assignment, 'resubmitSubmissions')}
                      />
                    )}
                  </FetchManyResourceRenderer>
                )}
              </ResourceRenderer>
            </div>
          )}
        </ResourceRenderer>
      </Page>
    );
  }
}

Solution.propTypes = {
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired,
    solutionId: PropTypes.string.isRequired,
  }).isRequired,
  assignment: PropTypes.object,
  children: PropTypes.element,
  solution: PropTypes.object,
  files: ImmutablePropTypes.map,
  userSolutionsSelector: PropTypes.func.isRequired,
  loggedInUserId: PropTypes.string,
  submitting: PropTypes.bool.isRequired,
  canSubmit: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  fetchScoreConfigIfNeeded: PropTypes.func.isRequired,
  evaluations: PropTypes.object,
  runtimeEnvironments: PropTypes.array,
  fetchStatus: PropTypes.string,
  scoreConfigSelector: PropTypes.func,
  assignmentSolversLoading: PropTypes.bool,
  assignmentSolverSelector: PropTypes.func.isRequired,
  isStudent: PropTypes.bool,
  editNote: PropTypes.func.isRequired,
  deleteEvaluation: PropTypes.func.isRequired,
  refreshSolutionEvaluations: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  initCanSubmit: PropTypes.func.isRequired,
  reloadCanSubmit: PropTypes.func.isRequired,
  intl: PropTypes.object,
  links: PropTypes.object.isRequired,
};

export default connect(
  (state, { params: { solutionId, assignmentId } }) => ({
    solution: getSolution(state, solutionId),
    files: getSolutionFiles(state, solutionId),
    userSolutionsSelector: getUserSolutionsSortedData(state),
    loggedInUserId: loggedInUserIdSelector(state),
    submitting: isSubmitting(state),
    canSubmit: canSubmitSolution(assignmentId)(state),
    assignment: getAssignment(state, assignmentId),
    evaluations: evaluationsForSubmissionSelector(state, solutionId),
    runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId),
    fetchStatus: fetchManyStatus(solutionId)(state),
    scoreConfigSelector: assignmentSubmissionScoreConfigSelector(state),
    assignmentSolversLoading: isAssignmentSolversLoading(state),
    assignmentSolverSelector: getAssignmentSolverSelector(state),
    isStudent: isLoggedAsStudent(state),
  }),
  (dispatch, { params }) => ({
    loadAsync: () => Solution.loadAsync(params, dispatch),
    fetchScoreConfigIfNeeded: submissionId => dispatch(fetchAssignmentSubmissionScoreConfigIfNeeded(submissionId)),
    editNote: note => dispatch(setNote(params.solutionId, note)),
    refreshSolutionEvaluations: () =>
      Promise.all([
        dispatch(fetchSolution(params.solutionId)),
        dispatch(fetchSubmissionEvaluationsForSolution(params.solutionId)),
      ]),
    deleteEvaluation: evaluationId =>
      dispatch(deleteSubmissionEvaluation(params.solutionId, evaluationId)).then(() =>
        dispatch(fetchSolutionIfNeeded(params.solutionId))
      ),
    download: (id, entry = null) => dispatch(download(id, entry)),
    initCanSubmit: userId => () => dispatch(init(userId, params.assignmentId)),
    reloadCanSubmit: () => dispatch(canSubmit(params.assignmentId)),
  })
)(injectIntl(withLinks(Solution)));
