import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { lruMemoize } from 'reselect';

import ResubmitReferenceSolutionContainer from '../../containers/ResubmitReferenceSolutionContainer';
import ReferenceSolutionActionsContainer from '../../containers/ReferenceSolutionActionsContainer';
import Page from '../../components/layout/Page';
import { ReferenceSolutionNavigation } from '../../components/layout/Navigation';
import SolutionDetail from '../../components/Solutions/SolutionDetail';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { TheButtonGroup } from '../../components/widgets/TheButton';
import Callout from '../../components/widgets/Callout';
import { ReferenceSolutionIcon } from '../../components/icons';

import {
  fetchReferenceSolutionIfNeeded,
  fetchReferenceSolution,
  setDescription,
} from '../../redux/modules/referenceSolutions';
import { fetchReferenceSolutionFilesIfNeeded } from '../../redux/modules/solutionFiles';
import { download } from '../../redux/modules/files';
import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { fetchReferenceSubmissionScoreConfigIfNeeded } from '../../redux/modules/exerciseScoreConfig';
import {
  fetchReferenceSolutionEvaluationsForSolution,
  deleteReferenceSolutionEvaluation,
} from '../../redux/modules/referenceSolutionEvaluations';

import { loggedInUserSelector } from '../../redux/selectors/users';
import { getReferenceSolution } from '../../redux/selectors/referenceSolutions';
import { getSolutionFiles } from '../../redux/selectors/solutionFiles';
import { getExercise } from '../../redux/selectors/exercises';
import { referenceSubmissionScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig';
import {
  evaluationsForReferenceSolutionSelector,
  fetchManyStatus,
} from '../../redux/selectors/referenceSolutionEvaluations';

import { hasPermissions } from '../../helpers/common';

const exerciseHasRuntime = lruMemoize(
  (exercise, runtimeId) => exercise.runtimeEnvironments.find(({ id }) => id === runtimeId) !== undefined
);

class ReferenceSolution extends Component {
  static loadAsync = ({ exerciseId, referenceSolutionId }, dispatch) =>
    Promise.all([
      dispatch(fetchReferenceSolutionIfNeeded(referenceSolutionId)),
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchReferenceSolutionEvaluationsForSolution(referenceSolutionId)),
      dispatch(fetchReferenceSolutionFilesIfNeeded(referenceSolutionId)),
    ]);

  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.referenceSolutionId !== prevProps.params.referenceSolutionId) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      referenceSolution,
      currentUser,
      files,
      download,
      exercise,
      fetchStatus,
      evaluations,
      editNote,
      refreshSolutionEvaluations,
      deleteEvaluation,
      scoreConfigSelector,
      fetchScoreConfigIfNeeded,
      intl: { locale },
    } = this.props;

    return (
      <Page
        icon={<ReferenceSolutionIcon />}
        title={<FormattedMessage id="app.referenceSolution.title" defaultMessage="Reference Solution Detail" />}
        resource={[referenceSolution, currentUser]}>
        {(referenceSolution, currentUser) => (
          <ResourceRenderer resource={exercise}>
            {exercise => (
              <>
                <ReferenceSolutionNavigation
                  solutionId={referenceSolution.id}
                  exerciseId={exercise.id}
                  userId={referenceSolution.authorId}
                  canEdit={hasPermissions(exercise, 'update')}
                  canViewTests={hasPermissions(exercise, 'viewConfig', 'viewScoreConfig')}
                  canViewLimits={hasPermissions(exercise, 'viewLimits')}
                  canViewAssignments={hasPermissions(exercise, 'viewAssignments')}
                />

                {hasPermissions(referenceSolution, 'evaluate') && (
                  <>
                    {exercise.isBroken ? (
                      <Callout variant="warning">
                        <FormattedMessage
                          id="app.referenceSolution.exerciseBroken"
                          defaultMessage="The exercise is broken. This reference solution may not be resubmitted at the moment."
                        />
                      </Callout>
                    ) : !exerciseHasRuntime(exercise, referenceSolution.runtimeEnvironmentId) ? (
                      <Callout variant="info">
                        <FormattedMessage
                          id="app.referenceSolution.exerciseNoLongerHasEnvironment"
                          defaultMessage="The exercise no longer supports the environment for which this solution was evaluated. Resubmission is not possible."
                        />
                      </Callout>
                    ) : (
                      <div className="mb-3">
                        <TheButtonGroup>
                          <ResubmitReferenceSolutionContainer
                            id={referenceSolution.id}
                            isDebug={false}
                            locale={locale}
                          />
                          <ResubmitReferenceSolutionContainer
                            id={referenceSolution.id}
                            isDebug={true}
                            locale={locale}
                          />

                          {hasPermissions(referenceSolution, 'setVisibility') && (
                            <ReferenceSolutionActionsContainer id={referenceSolution.id} />
                          )}
                        </TheButtonGroup>
                      </div>
                    )}
                  </>
                )}

                <FetchManyResourceRenderer fetchManyStatus={fetchStatus}>
                  {() => (
                    <SolutionDetail
                      solution={referenceSolution}
                      files={files}
                      evaluations={evaluations}
                      runtimeEnvironments={exercise.runtimeEnvironments}
                      currentUser={currentUser}
                      exercise={exercise}
                      editNote={hasPermissions(referenceSolution, 'update') ? editNote : null}
                      scoreConfigSelector={scoreConfigSelector}
                      download={download}
                      deleteEvaluation={deleteEvaluation}
                      refreshSolutionEvaluations={refreshSolutionEvaluations}
                      fetchScoreConfigIfNeeded={fetchScoreConfigIfNeeded}
                      canResubmit={hasPermissions(referenceSolution, 'evaluate')}
                    />
                  )}
                </FetchManyResourceRenderer>
              </>
            )}
          </ResourceRenderer>
        )}
      </Page>
    );
  }
}

ReferenceSolution.propTypes = {
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
    referenceSolutionId: PropTypes.string.isRequired,
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  fetchScoreConfigIfNeeded: PropTypes.func.isRequired,
  currentUser: ImmutablePropTypes.map,
  referenceSolution: ImmutablePropTypes.map,
  files: ImmutablePropTypes.map,
  exercise: ImmutablePropTypes.map,
  editNote: PropTypes.func.isRequired,
  refreshSolutionEvaluations: PropTypes.func,
  deleteEvaluation: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  fetchStatus: PropTypes.string,
  scoreConfigSelector: PropTypes.func,
  evaluations: ImmutablePropTypes.map,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(
  connect(
    (state, { params: { exerciseId, referenceSolutionId } }) => ({
      currentUser: loggedInUserSelector(state),
      referenceSolution: getReferenceSolution(state, referenceSolutionId),
      files: getSolutionFiles(state, referenceSolutionId),
      exercise: getExercise(exerciseId)(state),
      evaluations: evaluationsForReferenceSolutionSelector(state, referenceSolutionId),
      fetchStatus: fetchManyStatus(referenceSolutionId)(state),
      scoreConfigSelector: referenceSubmissionScoreConfigSelector(state),
    }),
    (dispatch, { params }) => ({
      loadAsync: () => ReferenceSolution.loadAsync(params, dispatch),
      fetchScoreConfigIfNeeded: submissionId => dispatch(fetchReferenceSubmissionScoreConfigIfNeeded(submissionId)),
      editNote: note => dispatch(setDescription(params.referenceSolutionId, note)),
      refreshSolutionEvaluations: () => {
        dispatch(fetchReferenceSolution(params.referenceSolutionId));
        dispatch(fetchReferenceSolutionEvaluationsForSolution(params.referenceSolutionId));
      },
      deleteEvaluation: evaluationId =>
        dispatch(deleteReferenceSolutionEvaluation(params.referenceSolutionId, evaluationId)),
      download: (id, entry = null) => dispatch(download(id, entry)),
    })
  )(ReferenceSolution)
);
