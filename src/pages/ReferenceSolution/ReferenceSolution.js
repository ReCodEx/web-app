import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { defaultMemoize } from 'reselect';

import ResubmitReferenceSolutionContainer from '../../containers/ResubmitReferenceSolutionContainer';
import Page from '../../components/layout/Page';
import ReferenceSolutionDetail from '../../components/ReferenceSolutions/ReferenceSolutionDetail';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Callout from '../../components/widgets/Callout';

import { fetchReferenceSolutionIfNeeded, fetchReferenceSolution } from '../../redux/modules/referenceSolutions';
import { fetchReferenceSolutionFilesIfNeeded } from '../../redux/modules/solutionFiles';
import { download } from '../../redux/modules/files';
import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { fetchReferenceSubmissionScoreConfigIfNeeded } from '../../redux/modules/exerciseScoreConfig';
import {
  fetchReferenceSolutionEvaluationsForSolution,
  deleteReferenceSolutionEvaluation,
} from '../../redux/modules/referenceSolutionEvaluations';

import { getReferenceSolution } from '../../redux/selectors/referenceSolutions';
import { getSolutionFiles } from '../../redux/selectors/solutionFiles';
import { getExercise } from '../../redux/selectors/exercises';
import { referenceSubmissionScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig';
import {
  evaluationsForReferenceSolutionSelector,
  fetchManyStatus,
} from '../../redux/selectors/referenceSolutionEvaluations';

import { ENV_CS_DOTNET_CORE_ID } from '../../helpers/exercise/environments';
import { hasPermissions } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';

const messages = defineMessages({
  title: {
    id: 'app.exercise.referenceSolutionTitle',
    defaultMessage: 'Reference Solution Overview',
  },
});

const exerciseHasRuntime = defaultMemoize(
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

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.referenceSolutionId !== prevProps.match.params.referenceSolutionId) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      referenceSolution,
      files,
      download,
      exercise,
      match: {
        params: { exerciseId },
      },
      fetchStatus,
      evaluations,
      refreshSolutionEvaluations,
      deleteEvaluation,
      scoreConfigSelector,
      fetchScoreConfigIfNeeded,
      intl: { formatMessage, locale },
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY },
    } = this.props;

    return (
      <Page
        title={formatMessage(messages.title)}
        resource={referenceSolution}
        description={<FormattedMessage id="app.exercise.overview" defaultMessage="Exercise overview" />}
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.exercises.title" defaultMessage="Exercises List" />,
            iconName: 'puzzle-piece',
            link: EXERCISES_URI,
          },
          {
            text: <FormattedMessage id="app.exercise.overview" defaultMessage="Exercise overview" />,
            iconName: ['far', 'lightbulb'],
            link: EXERCISE_URI_FACTORY(exerciseId),
          },
          {
            text: (
              <FormattedMessage id="app.exercise.referenceSolutionDetail" defaultMessage="Reference Solution Detail" />
            ),
            iconName: ['far', 'gem'],
          },
        ]}>
        {referenceSolution => (
          <ResourceRenderer resource={exercise}>
            {exercise => (
              <>
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

                          {referenceSolution.runtimeEnvironmentId ===
                          ENV_CS_DOTNET_CORE_ID /* temporary disable debug resubmits of .NET Core */ ? (
                            <Button disabled={true}>
                              <FormattedMessage
                                id="app.solution.dotnetResubmitTemporaryDisabled"
                                defaultMessage="Debug Resubmit Temporary Disabled"
                              />
                            </Button>
                          ) : (
                            <ResubmitReferenceSolutionContainer
                              id={referenceSolution.id}
                              isDebug={true}
                              locale={locale}
                            />
                          )}
                        </TheButtonGroup>
                      </div>
                    )}
                  </>
                )}

                <FetchManyResourceRenderer fetchManyStatus={fetchStatus}>
                  {() => (
                    <ReferenceSolutionDetail
                      solution={referenceSolution}
                      files={files}
                      download={download}
                      evaluations={evaluations}
                      exercise={exercise}
                      deleteEvaluation={deleteEvaluation}
                      refreshSolutionEvaluations={refreshSolutionEvaluations}
                      runtimeEnvironments={exercise.runtimeEnvironments}
                      scoreConfigSelector={scoreConfigSelector}
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      exerciseId: PropTypes.string.isRequired,
      referenceSolutionId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  fetchScoreConfigIfNeeded: PropTypes.func.isRequired,
  referenceSolution: ImmutablePropTypes.map,
  files: ImmutablePropTypes.map,
  exercise: ImmutablePropTypes.map,
  refreshSolutionEvaluations: PropTypes.func,
  deleteEvaluation: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  fetchStatus: PropTypes.string,
  scoreConfigSelector: PropTypes.func,
  evaluations: ImmutablePropTypes.map,
  intl: PropTypes.object.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  injectIntl(
    connect(
      (
        state,
        {
          match: {
            params: { exerciseId, referenceSolutionId },
          },
        }
      ) => ({
        referenceSolution: getReferenceSolution(referenceSolutionId)(state),
        files: getSolutionFiles(state, referenceSolutionId),
        exercise: getExercise(exerciseId)(state),
        evaluations: evaluationsForReferenceSolutionSelector(referenceSolutionId)(state),
        fetchStatus: fetchManyStatus(referenceSolutionId)(state),
        scoreConfigSelector: referenceSubmissionScoreConfigSelector(state),
      }),
      (dispatch, { match: { params } }) => ({
        loadAsync: () => ReferenceSolution.loadAsync(params, dispatch),
        fetchScoreConfigIfNeeded: submissionId => dispatch(fetchReferenceSubmissionScoreConfigIfNeeded(submissionId)),
        refreshSolutionEvaluations: () => {
          dispatch(fetchReferenceSolution(params.referenceSolutionId));
          dispatch(fetchReferenceSolutionEvaluationsForSolution(params.referenceSolutionId));
        },
        deleteEvaluation: evaluationId =>
          dispatch(deleteReferenceSolutionEvaluation(params.referenceSolutionId, evaluationId)),
        download: (id, entry = null) => dispatch(download(id, entry)),
      })
    )(ReferenceSolution)
  )
);
