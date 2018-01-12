import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import EditSimpleLimitsForm from '../../components/forms/EditSimpleLimitsForm/EditSimpleLimitsForm';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import EditTestsForm from '../../components/forms/EditTestsForm';
import EditExerciseSimpleConfigForm from '../../components/forms/EditExerciseSimpleConfigForm';
import EditEnvironmentSimpleForm from '../../components/forms/EditEnvironmentSimpleForm';

import {
  fetchExercise,
  fetchExerciseIfNeeded
} from '../../redux/modules/exercises';
import {
  fetchExerciseEnvironmentSimpleLimitsIfNeeded,
  editEnvironmentSimpleLimits,
  cloneHorizontally,
  cloneVertically,
  cloneAll,
  fetchExerciseEnvironmentSimpleLimits
} from '../../redux/modules/simpleLimits';
import {
  fetchExerciseConfig,
  fetchExerciseConfigIfNeeded,
  setExerciseConfig
} from '../../redux/modules/exerciseConfigs';
import { getExercise } from '../../redux/selectors/exercises';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { simpleLimitsSelector } from '../../redux/selectors/simpleLimits';

import withLinks from '../../hoc/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';
import { exerciseEnvironmentConfigSelector } from '../../redux/selectors/exerciseEnvironmentConfigs';
import {
  fetchExerciseEnvironmentConfig,
  fetchExerciseEnvironmentConfigIfNeeded,
  setExerciseEnvironmentConfig
} from '../../redux/modules/exerciseEnvironmentConfigs';
import { exerciseScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig';
import {
  fetchScoreConfigIfNeeded,
  setScoreConfig
} from '../../redux/modules/exerciseScoreConfig';
import {
  fetchExerciseTestsIfNeeded,
  setExerciseTests
} from '../../redux/modules/exerciseTests';
import { exerciseTestsSelector } from '../../redux/selectors/exerciseTests';
import { fetchPipelines } from '../../redux/modules/pipelines';
import { pipelinesSelector } from '../../redux/selectors/pipelines';

import {
  getEnvInitValues,
  transformEnvValues,
  getTestsInitValues,
  transformAndSendTestsValues,
  getSimpleConfigInitValues,
  transformAndSendConfigValues,
  getLimitsInitValues,
  transformAndSendLimitsValues
} from '../../helpers/exerciseSimpleForm';

class EditExerciseSimpleConfig extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.exerciseId !== props.params.exerciseId) {
      props.loadAsync();
    }
  };

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)).then(({ value: exercise }) =>
        Promise.all(
          exercise.runtimeEnvironments.map(environment =>
            dispatch(
              fetchExerciseEnvironmentSimpleLimitsIfNeeded(
                exerciseId,
                environment.id
              )
            )
          )
        )
      ),
      dispatch(fetchExerciseConfigIfNeeded(exerciseId)),
      dispatch(fetchExerciseEnvironmentConfigIfNeeded(exerciseId)),
      dispatch(fetchScoreConfigIfNeeded(exerciseId)),
      dispatch(fetchExerciseTestsIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchPipelines())
    ]);

  render() {
    const {
      links: { EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      runtimeEnvironments,
      exerciseConfig,
      fetchEnvironmentSimpleLimits,
      editEnvironmentSimpleLimits,
      exerciseEnvironmentConfig,
      editEnvironmentConfigs,
      exerciseScoreConfig,
      exerciseTests,
      editScoreConfig,
      editTests,
      fetchConfig,
      setConfig,
      limits,
      pipelines,
      cloneHorizontally,
      cloneVertically,
      cloneAll,
      reloadConfigAndLimits,
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={exercise}
        title={exercise => <LocalizedExerciseName entity={exercise} />}
        description={
          <FormattedMessage
            id="app.editExerciseConfig.description"
            defaultMessage="Change exercise configuration"
          />
        }
        breadcrumbs={[
          {
            resource: exercise,
            breadcrumb: ({ name, localizedTexts }) => ({
              text: (
                <FormattedMessage
                  id="app.exercise.breadcrumbTitle"
                  defaultMessage="Exercise {name}"
                  values={{
                    name: getLocalizedName({ name, localizedTexts }, locale)
                  }}
                />
              ),
              iconName: 'puzzle-piece',
              link: EXERCISE_URI_FACTORY(exerciseId)
            })
          },
          {
            text: (
              <FormattedMessage
                id="app.editExerciseConfig.title"
                defaultMessage="Edit exercise config"
              />
            ),
            iconName: 'pencil'
          }
        ]}
      >
        {exercise =>
          <div>
            <Row>
              <Col lg={6}>
                <Box
                  title={
                    <FormattedMessage
                      id="app.editExercise.editTests"
                      defaultMessage="Edit tests"
                    />
                  }
                  unlimitedHeight
                >
                  <ResourceRenderer
                    resource={[exerciseScoreConfig, exerciseTests]}
                  >
                    {(scoreConfig, tests) =>
                      <EditTestsForm
                        initialValues={getTestsInitValues(
                          tests,
                          scoreConfig,
                          locale
                        )}
                        onSubmit={data =>
                          transformAndSendTestsValues(
                            data,
                            editTests,
                            editScoreConfig
                          ).then(() =>
                            Promise.all([
                              fetchConfig(),
                              fetchEnvironmentSimpleLimits()
                            ])
                          )}
                      />}
                  </ResourceRenderer>
                </Box>
                <Box
                  title={
                    <FormattedMessage
                      id="app.editExercise.editEnvironments"
                      defaultMessage="Edit runtime environments"
                    />
                  }
                  unlimitedHeight
                >
                  <ResourceRenderer
                    resource={[
                      exerciseConfig,
                      exerciseTests,
                      exerciseEnvironmentConfig,
                      ...pipelines.toArray()
                    ]}
                  >
                    {(config, tests, environmentConfigs, ...pipelines) =>
                      <ResourceRenderer
                        resource={runtimeEnvironments.toArray()}
                      >
                        {(...environments) =>
                          <EditEnvironmentSimpleForm
                            initialValues={getEnvInitValues(environmentConfigs)}
                            runtimeEnvironments={environments}
                            onSubmit={data => {
                              const newEnvironments = transformEnvValues(
                                data,
                                environments
                              );
                              return editEnvironmentConfigs({
                                environmentConfigs: newEnvironments
                              })
                                .then(() =>
                                  transformAndSendConfigValues(
                                    getSimpleConfigInitValues(config, tests),
                                    pipelines,
                                    newEnvironments,
                                    tests,
                                    config,
                                    setConfig
                                  )
                                )
                                .then(reloadConfigAndLimits(exercise.id));
                            }}
                          />}
                      </ResourceRenderer>}
                  </ResourceRenderer>
                </Box>
              </Col>
              <Col lg={6}>
                <SupplementaryFilesTableContainer exercise={exercise} />
              </Col>
            </Row>
            <br />

            <Row>
              <Col lg={12}>
                <ResourceRenderer
                  resource={[
                    exerciseConfig,
                    exerciseTests,
                    exerciseEnvironmentConfig,
                    ...pipelines.toArray()
                  ]}
                >
                  {(config, tests, environments, ...pipelines) =>
                    tests.length > 0
                      ? <EditExerciseSimpleConfigForm
                          initialValues={getSimpleConfigInitValues(
                            config,
                            tests
                          )}
                          exercise={exercise}
                          exerciseTests={tests}
                          onSubmit={data =>
                            transformAndSendConfigValues(
                              data,
                              pipelines,
                              environments,
                              tests,
                              config,
                              setConfig
                            )}
                        />
                      : <div className="alert alert-warning">
                          <h4>
                            <i className="icon fa fa-warning" />{' '}
                            <FormattedMessage
                              id="app.editExercise.editConfig"
                              defaultMessage="Edit exercise configuration"
                            />
                          </h4>
                          <FormattedMessage
                            id="app.editExerciseSimpleConfig.noTests"
                            defaultMessage="There are no tests yet. The form cannot be displayed until at least one test is created."
                          />
                        </div>}
                </ResourceRenderer>
              </Col>
            </Row>
            <br />

            <Row>
              <Col lg={12}>
                <ResourceRenderer
                  resource={[
                    exerciseTests,
                    exerciseEnvironmentConfig,
                    ...limits.toArray()
                  ]}
                >
                  {(tests, envConfig) =>
                    tests.length > 0 && exercise.runtimeEnvironments.length > 0
                      ? <EditSimpleLimitsForm
                          onSubmit={data =>
                            transformAndSendLimitsValues(
                              data,
                              tests,
                              exercise.runtimeEnvironments,
                              editEnvironmentSimpleLimits
                            )}
                          environments={exercise.runtimeEnvironments}
                          tests={tests}
                          initialValues={getLimitsInitValues(
                            limits,
                            tests,
                            exercise.runtimeEnvironments,
                            exercise.id
                          )}
                          cloneVertically={cloneVertically}
                          cloneHorizontally={cloneHorizontally}
                          cloneAll={cloneAll}
                        />
                      : <div className="alert alert-warning">
                          <h4>
                            <i className="icon fa fa-warning" />{' '}
                            <FormattedMessage
                              id="app.editLimitsBox.title"
                              defaultMessage="Edit limits"
                            />
                          </h4>
                          <FormattedMessage
                            id="app.editExerciseSimpleConfig.noTestsOrEnvironments"
                            defaultMessage="There are no tests or no enabled environments yet. The form cannot be displayed until at least one test is created and one environment is enabled."
                          />
                        </div>}
                </ResourceRenderer>
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

EditExerciseSimpleConfig.propTypes = {
  exercise: ImmutablePropTypes.map,
  runtimeEnvironments: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  exerciseConfig: PropTypes.object,
  exerciseEnvironmentConfig: PropTypes.object,
  editEnvironmentConfigs: PropTypes.func.isRequired,
  fetchEnvironmentSimpleLimits: PropTypes.func.isRequired,
  editEnvironmentSimpleLimits: PropTypes.func.isRequired,
  exerciseScoreConfig: PropTypes.object,
  exerciseTests: PropTypes.object,
  editScoreConfig: PropTypes.func.isRequired,
  editTests: PropTypes.func.isRequired,
  fetchConfig: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  limits: PropTypes.object.isRequired,
  pipelines: ImmutablePropTypes.map,
  cloneHorizontally: PropTypes.func.isRequired,
  cloneVertically: PropTypes.func.isRequired,
  cloneAll: PropTypes.func.isRequired,
  reloadConfigAndLimits: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(
  withLinks(
    connect(
      (state, { params: { exerciseId } }) => {
        return {
          exercise: getExercise(exerciseId)(state),
          userId: loggedInUserIdSelector(state),
          runtimeEnvironments: runtimeEnvironmentsSelector(state),
          exerciseConfig: exerciseConfigSelector(exerciseId)(state),
          limits: simpleLimitsSelector(state),
          exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(
            exerciseId
          )(state),
          exerciseScoreConfig: exerciseScoreConfigSelector(exerciseId)(state),
          exerciseTests: exerciseTestsSelector(exerciseId)(state),
          pipelines: pipelinesSelector(state)
        };
      },
      (dispatch, { params: { exerciseId } }) => ({
        loadAsync: () =>
          EditExerciseSimpleConfig.loadAsync({ exerciseId }, dispatch),
        fetchEnvironmentSimpleLimits: () =>
          dispatch(
            fetchExerciseIfNeeded(exerciseId)
          ).then(({ value: exercise }) =>
            Promise.all(
              exercise.runtimeEnvironments.map(environment =>
                dispatch(
                  fetchExerciseEnvironmentSimpleLimits(
                    exerciseId,
                    environment.id
                  )
                )
              )
            )
          ),
        editEnvironmentSimpleLimits: (runtimeEnvironmentId, data) =>
          dispatch(
            editEnvironmentSimpleLimits(exerciseId, runtimeEnvironmentId, data)
          ),
        editEnvironmentConfigs: data =>
          dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
        editScoreConfig: data => dispatch(setScoreConfig(exerciseId, data)),
        editTests: data => dispatch(setExerciseTests(exerciseId, data)),
        fetchConfig: () => dispatch(fetchExerciseConfig(exerciseId)),
        setConfig: data => dispatch(setExerciseConfig(exerciseId, data)),
        cloneVertically: (
          formName,
          testName,
          runtimeEnvironmentId
        ) => field => () =>
          dispatch(
            cloneVertically(formName, testName, runtimeEnvironmentId, field)
          ),
        cloneHorizontally: (
          formName,
          testName,
          runtimeEnvironmentId
        ) => field => () =>
          dispatch(
            cloneHorizontally(formName, testName, runtimeEnvironmentId, field)
          ),
        cloneAll: (formName, testName, runtimeEnvironmentId) => field => () =>
          dispatch(cloneAll(formName, testName, runtimeEnvironmentId, field)),

        reloadConfigAndLimits: exerciseId => () =>
          dispatch(fetchExercise(exerciseId)).then(({ value: exercise }) =>
            Promise.all([
              dispatch(fetchExerciseConfig(exerciseId)),
              dispatch(fetchExerciseEnvironmentConfig(exerciseId)),
              ...exercise.runtimeEnvironments.map(environment =>
                dispatch(
                  fetchExerciseEnvironmentSimpleLimits(
                    exerciseId,
                    environment.id
                  )
                )
              )
            ])
          )
      })
    )(EditExerciseSimpleConfig)
  )
);
