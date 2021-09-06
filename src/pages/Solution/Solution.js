import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SolutionDetail, { FailedSubmissionDetail } from '../../components/Solutions/SolutionDetail';
import AcceptSolutionContainer from '../../containers/AcceptSolutionContainer';
import ReviewSolutionContainer from '../../containers/ReviewSolutionContainer';
import ResubmitSolutionContainer from '../../containers/ResubmitSolutionContainer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';

import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchSolution, fetchSolutionIfNeeded, fetchUsersSolutions, setNote } from '../../redux/modules/solutions';
import { fetchAssignmentSolutionFilesIfNeeded } from '../../redux/modules/solutionFiles';
import { download } from '../../redux/modules/files';
import {
  fetchSubmissionEvaluationsForSolution,
  deleteSubmissionEvaluation,
} from '../../redux/modules/submissionEvaluations';
import { fetchAssignmentSubmissionScoreConfigIfNeeded } from '../../redux/modules/exerciseScoreConfig';
import { getSolution } from '../../redux/selectors/solutions';
import { getSolutionFiles } from '../../redux/selectors/solutionFiles';
import {
  getAssignment,
  assignmentEnvironmentsSelector,
  getUserSolutionsSortedData,
} from '../../redux/selectors/assignments';
import { evaluationsForSubmissionSelector, fetchManyStatus } from '../../redux/selectors/submissionEvaluations';
import { assignmentSubmissionScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig';

import { ENV_CS_DOTNET_CORE_ID } from '../../helpers/exercise/environments';
import { getLocalizedName } from '../../helpers/localizedData';
import { WarningIcon } from '../../components/icons';

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
        .then(solution => dispatch(fetchUsersSolutions(solution.authorId, assignmentId))),
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
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={assignment => getLocalizedName(assignment, locale)}
        description={<FormattedMessage id="app.submission.evaluation.title" defaultMessage="Solution evaluation" />}
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'tasks',
            breadcrumb: assignment => ({
              text: <FormattedMessage id="app.group.assignmentsLong" defaultMessage="Group Assignments" />,
              link: ({ GROUP_DETAIL_URI_FACTORY }) => GROUP_DETAIL_URI_FACTORY(assignment.groupId),
            }),
          },
          {
            resource: assignment,
            iconName: 'puzzle-piece',
            breadcrumb: assignment => ({
              text: <FormattedMessage id="app.exercise.title" defaultMessage="Exercise" />,
              link: ({ EXERCISE_URI_FACTORY }) =>
                assignment.permissionHints && assignment.permissionHints.viewDescription // not ideal, but closest we can get with permissions
                  ? EXERCISE_URI_FACTORY(assignment.exerciseId)
                  : '#',
            }),
          },
          {
            text: <FormattedMessage id="app.assignment.title" defaultMessage="Exercise Assignment" />,
            iconName: 'hourglass-start',
            link: ({ ASSIGNMENT_DETAIL_URI_FACTORY }) => ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId),
          },
          {
            text: <FormattedMessage id="app.solution.title" defaultMessage="The Solution" />,
            iconName: 'user',
          },
        ]}>
        <ResourceRenderer failed={<FailedSubmissionDetail />} resource={[solution, assignment]}>
          {(solution, assignment) => (
            <div>
              {((solution.permissionHints && solution.permissionHints.setFlag) ||
                (assignment.permissionHints && assignment.permissionHints.resubmitSubmissions)) && (
                <div className="mb-3">
                  <TheButtonGroup>
                    {solution.permissionHints && solution.permissionHints.setFlag && (
                      <>
                        <AcceptSolutionContainer id={solution.id} locale={locale} />
                        <ReviewSolutionContainer id={solution.id} locale={locale} />
                      </>
                    )}

                    {assignment.permissionHints &&
                      assignment.permissionHints.resubmitSubmissions &&
                      assignmentHasRuntime(assignment, solution.runtimeEnvironmentId) && (
                        <>
                          <ResubmitSolutionContainer
                            id={solution.id}
                            assignmentId={assignment.id}
                            isDebug={false}
                            userId={solution.authorId}
                            locale={locale}
                          />

                          {solution.runtimeEnvironmentId ===
                          ENV_CS_DOTNET_CORE_ID /* temporary disable debug resubmits of .NET Core */ ? (
                            <Button disabled={true}>
                              <FormattedMessage
                                id="app.solution.dotnetResubmitTemporaryDisabled"
                                defaultMessage="Debug Resubmit Temporary Disabled"
                              />
                            </Button>
                          ) : (
                            <ResubmitSolutionContainer
                              id={solution.id}
                              assignmentId={assignment.id}
                              isDebug={true}
                              userId={solution.authorId}
                              locale={locale}
                            />
                          )}
                        </>
                      )}
                  </TheButtonGroup>

                  {!(
                    assignment.permissionHints &&
                    assignment.permissionHints.resubmitSubmissions &&
                    assignmentHasRuntime(assignment, solution.runtimeEnvironmentId)
                  ) && (
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
                        assignment={assignment}
                        evaluations={evaluations}
                        runtimeEnvironments={runtimes}
                        deleteEvaluation={deleteEvaluation}
                        refreshSolutionEvaluations={refreshSolutionEvaluations}
                        editNote={solution.permissionHints && solution.permissionHints.update ? editNote : null}
                        scoreConfigSelector={scoreConfigSelector}
                        fetchScoreConfigIfNeeded={fetchScoreConfigIfNeeded}
                        canResubmit={assignment.permissionHints && assignment.permissionHints.resubmitSubmissions}
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
    solution: getSolution(solutionId)(state),
    files: getSolutionFiles(state, solutionId),
    userSolutionsSelector: getUserSolutionsSortedData(state),
    assignment: getAssignment(state)(assignmentId),
    evaluations: evaluationsForSubmissionSelector(solutionId)(state),
    runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId),
    fetchStatus: fetchManyStatus(solutionId)(state),
    scoreConfigSelector: assignmentSubmissionScoreConfigSelector(state),
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
