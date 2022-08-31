import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { AssignmentSolutionNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SolutionDetail, { FailedSubmissionDetail } from '../../components/Solutions/SolutionDetail';
import AcceptSolutionContainer from '../../containers/AcceptSolutionContainer';
import ReviewSolutionContainer from '../../containers/ReviewSolutionContainer';
import ResubmitSolutionContainer from '../../containers/ResubmitSolutionContainer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { TheButtonGroup } from '../../components/widgets/TheButton';

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
import { getSolution, isAssignmentSolversLoading, getAssignmentSolverSelector } from '../../redux/selectors/solutions';
import { getSolutionFiles } from '../../redux/selectors/solutionFiles';
import {
  getAssignment,
  assignmentEnvironmentsSelector,
  getUserSolutionsSortedData,
} from '../../redux/selectors/assignments';
import { evaluationsForSubmissionSelector, fetchManyStatus } from '../../redux/selectors/submissionEvaluations';
import { assignmentSubmissionScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig';

import { hasPermissions } from '../../helpers/common';
import { SolutionResultsIcon, WarningIcon } from '../../components/icons';

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
        .then(solution =>
          Promise.all([
            dispatch(fetchUsersSolutions(solution.authorId, assignmentId)),
            dispatch(fetchAssignmentSolversIfNeeded({ assignmentId, userId: solution.authorId })),
          ])
        ),
      dispatch(fetchSubmissionEvaluationsForSolution(solutionId)),
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchAssignmentSolutionFilesIfNeeded(solutionId)),
    ]);

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.solutionId !== prevProps.match.params.solutionId) {
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
      match: {
        params: { assignmentId },
      },
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
      intl: { locale },
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
                canViewSolutions={hasPermissions(assignment, 'viewAssignmentSolutions')}
                canViewExercise={
                  hasPermissions(
                    assignment,
                    'viewAssignmentSolutions'
                  ) /* this is not the actual permission, but close enough */
                }
                canViewUserProfile={hasPermissions(assignment, 'viewAssignmentSolutions')}
              />

              {(hasPermissions(solution, 'setFlag') || hasPermissions(assignment, 'resubmitSubmissions')) && (
                <div className="mb-3">
                  <TheButtonGroup>
                    {hasPermissions(solution, 'setFlag') && (
                      <>
                        <AcceptSolutionContainer id={solution.id} locale={locale} />
                        <ReviewSolutionContainer id={solution.id} locale={locale} />
                      </>
                    )}

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
                </div>
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      assignmentId: PropTypes.string.isRequired,
      solutionId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  assignment: PropTypes.object,
  children: PropTypes.element,
  solution: PropTypes.object,
  files: ImmutablePropTypes.map,
  userSolutionsSelector: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  fetchScoreConfigIfNeeded: PropTypes.func.isRequired,
  evaluations: PropTypes.object,
  runtimeEnvironments: PropTypes.array,
  fetchStatus: PropTypes.string,
  scoreConfigSelector: PropTypes.func,
  assignmentSolversLoading: PropTypes.bool,
  assignmentSolverSelector: PropTypes.func.isRequired,
  editNote: PropTypes.func.isRequired,
  deleteEvaluation: PropTypes.func.isRequired,
  refreshSolutionEvaluations: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default connect(
  (
    state,
    {
      match: {
        params: { solutionId, assignmentId },
      },
    }
  ) => ({
    solution: getSolution(state, solutionId),
    files: getSolutionFiles(state, solutionId),
    userSolutionsSelector: getUserSolutionsSortedData(state),
    assignment: getAssignment(state)(assignmentId),
    evaluations: evaluationsForSubmissionSelector(state, solutionId),
    runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId),
    fetchStatus: fetchManyStatus(solutionId)(state),
    scoreConfigSelector: assignmentSubmissionScoreConfigSelector(state),
    assignmentSolversLoading: isAssignmentSolversLoading(state),
    assignmentSolverSelector: getAssignmentSolverSelector(state),
  }),
  (dispatch, { match: { params } }) => ({
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
  })
)(injectIntl(Solution));
