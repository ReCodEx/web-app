import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import EditTestsForm from '../../components/forms/EditTestsForm';
import EditExerciseSimpleConfigForm from '../../components/forms/EditExerciseSimpleConfigForm';
import EditEnvironmentSimpleForm from '../../components/forms/EditEnvironmentSimpleForm';
// import EditEnvironmentConfigForm from '../../components/forms/EditEnvironmentConfigForm';
// import PipelinesSimpleList from '../../components/Pipelines/PipelinesSimpleList';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import { NeedFixingIcon } from '../../components/icons';

import {
  fetchExercise,
  fetchExerciseIfNeeded
} from '../../redux/modules/exercises';
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
/*
import {
  deletePipeline,
  fetchExercisePipelines
} from '../../redux/modules/pipelines';
import { exercisePipelinesSelector } from '../../redux/selectors/pipelines';
*/

import withLinks from '../../helpers/withLinks';
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
import {
  pipelinesSelector,
  getPipelinesEnvironmentsWhichHasEntryPoint
} from '../../redux/selectors/pipelines';

import {
  getTestsInitValues,
  transformTestsValues
} from '../../helpers/exercise/tests';
import {
  getEnvInitValues,
  transformEnvValues
} from '../../helpers/exercise/environments';
import {
  isSimple,
  getSimpleConfigInitValues,
  transformConfigValues
} from '../../helpers/exercise/config';
import { hasPermissions } from '../../helpers/common';

class EditExerciseConfig extends Component {
  componentWillMount = () => this.props.loadAsync();

  componentWillReceiveProps = nextProps => {
    if (this.props.params.exerciseId !== nextProps.params.exerciseId) {
      nextProps.loadAsync();
    }
  };

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)).then(
        ({ value: data }) =>
          hasPermissions(data, 'update') &&
          Promise.all([
            dispatch(fetchExerciseConfigIfNeeded(exerciseId)),
            dispatch(fetchExerciseEnvironmentConfigIfNeeded(exerciseId)),
            dispatch(fetchRuntimeEnvironments())
          ])
      ),
      dispatch(fetchScoreConfigIfNeeded(exerciseId)),
      dispatch(fetchExerciseTestsIfNeeded(exerciseId)),
      dispatch(fetchPipelines())
    ]);

  transformAndSendTestsValues = data => {
    const { editTests, editScoreConfig, reloadConfig } = this.props;
    const { tests, scoreConfig } = transformTestsValues(data);
    return Promise.all([
      editTests({ tests }),
      editScoreConfig({ scoreConfig })
    ]).then(reloadConfig);
  };

  transformAndSendConfigValuesCreator = defaultMemoize(
    (pipelines, environmentConfigs, tests, config) => {
      const { setConfig, reloadExercise } = this.props;
      return data =>
        setConfig(
          transformConfigValues(
            data,
            pipelines,
            environmentConfigs,
            tests,
            config
          )
        ).then(reloadExercise);
    }
  );

  transformAndSendEnvValuesCreator = defaultMemoize(
    (pipelines, environments, tests, config, environmentConfigs) => {
      const { editEnvironmentConfigs, reloadConfig, setConfig } = this.props;

      return data => {
        const newEnvironments = transformEnvValues(
          data,
          environmentConfigs,
          environments
        );
        const configData = transformConfigValues(
          getSimpleConfigInitValues(config, tests, environmentConfigs),
          pipelines,
          newEnvironments,
          tests,
          config
        );
        return editEnvironmentConfigs({
          environmentConfigs: newEnvironments
        })
          .then(() => setConfig(configData))
          .then(reloadConfig);
      };
    }
  );

  render() {
    const {
      params: { exerciseId },
      exercise,
      runtimeEnvironments,
      exerciseConfig,
      exerciseEnvironmentConfig,
      exerciseScoreConfig,
      exerciseTests,
      pipelines,
      // exercisePipelines,
      environmentsWithEntryPoints,
      intl: { locale },
      links: {
        EXERCISE_URI_FACTORY
        // PIPELINE_EDIT_URI_FACTORY
      }
    } = this.props;

    return (
      <Page
        resource={[exercise, exerciseTests]}
        title={exercise => getLocalizedName(exercise, locale)}
        description={
          <FormattedMessage
            id="app.editExerciseConfig.description"
            defaultMessage="Change exercise tests configuration"
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
                defaultMessage="Edit tests configuration"
              />
            ),
            iconName: ['far', 'edit']
          }
        ]}
      >
        {(exercise, tests) =>
          <div>
            <ResourceRenderer
              resource={pipelines.toArray()}
              returnAsArray={true}
            >
              {(
                pipelines // pipelines are returned as a whole array (so they can be cached properly)
              ) =>
                <div>
                  {exercise.isBroken &&
                    <Row>
                      <Col sm={12}>
                        <div className="alert alert-warning">
                          <h4>
                            <NeedFixingIcon gapRight />
                            <FormattedMessage
                              id="app.exercise.isBroken"
                              defaultMessage="Exercise configuration is incorrect and needs fixing"
                            />
                          </h4>
                          {exercise.validationError}
                        </div>
                      </Col>
                    </Row>}

                  <Row>
                    <Col sm={12}>
                      <ExerciseButtons {...exercise} />
                    </Col>
                  </Row>

                  {isSimple(exercise) &&
                    hasPermissions(exercise, 'update') &&
                    <Row>
                      <Col sm={12}>TODO button</Col>
                    </Row>}

                  <Row>
                    <Col lg={6}>
                      <Box
                        title={
                          <FormattedMessage
                            id="app.editExercise.testsAndScoring"
                            defaultMessage="Tests and Scoring"
                          />
                        }
                        unlimitedHeight
                      >
                        <ResourceRenderer resource={exerciseScoreConfig}>
                          {scoreConfig =>
                            <EditTestsForm
                              readOnly={
                                !hasPermissions(exercise, 'setScoreConfig')
                              }
                              initialValues={getTestsInitValues(
                                tests,
                                scoreConfig,
                                locale
                              )}
                              onSubmit={this.transformAndSendTestsValues}
                            />}
                        </ResourceRenderer>
                      </Box>

                      {isSimple(exercise) &&
                        hasPermissions(exercise, 'update') &&
                        <Box
                          title={
                            <FormattedMessage
                              id="app.editExercise.runtimeEnvironments"
                              defaultMessage="Runtime Environments"
                            />
                          }
                          unlimitedHeight
                        >
                          <ResourceRenderer
                            resource={[
                              exerciseConfig,
                              exerciseEnvironmentConfig
                            ]}
                          >
                            {(config, environmentConfigs) =>
                              <ResourceRenderer
                                resource={runtimeEnvironments.toArray()}
                                returnAsArray={true}
                              >
                                {environments =>
                                  <EditEnvironmentSimpleForm
                                    initialValues={getEnvInitValues(
                                      environmentConfigs,
                                      environments
                                    )}
                                    runtimeEnvironments={environments}
                                    onSubmit={this.transformAndSendEnvValuesCreator(
                                      pipelines,
                                      environments,
                                      tests,
                                      config,
                                      environmentConfigs
                                    )}
                                  />}
                              </ResourceRenderer>}
                          </ResourceRenderer>
                        </Box>}

                      {!isSimple(exercise) &&
                        <Box
                          title={
                            <FormattedMessage
                              id="app.editExercise.runtimeEnvironment"
                              defaultMessage="Runtime Environment"
                            />
                          }
                          unlimitedHeight
                        >
                          <ResourceRenderer
                            resource={[
                              exerciseConfig,
                              exerciseEnvironmentConfig
                            ]}
                          >
                            {(config, environmentConfigs) =>
                              <div className="callout callout-warning">
                                EditEnvironmentConfigForm - TODO
                              </div>
                            /* <EditEnvironmentConfigForm
                                initialValues={getEnvInitValues(
                                  environmentConfigs,
                                  environments
                                )}
                                runtimeEnvironments={environments}
                                onSubmit={this.transformAndSendEnvValuesCreator(
                                  pipelines,
                                  environments,
                                  tests,
                                  config,
                                  environmentConfigs
                                )}
                              /> */
                            }
                          </ResourceRenderer>
                        </Box>}
                    </Col>

                    <Col lg={6}>
                      <SupplementaryFilesTableContainer exercise={exercise} />
                      {!isSimple(exercise) &&
                        <div className="callout callout-warning">
                          Pipelines - TODO
                        </div>}

                      {/* exercise.configurationType !== 'simpleExerciseConfig' &&
                  <Box
                    title={
                      <FormattedMessage
                        id="app.exercise.exercisePipelines"
                        defaultMessage="Exercise Pipelines"
                      />
                    }
                    footer={
                      <p className="text-center">
                        <Button
                          bsStyle="success"
                          className="btn-flat"
                          bsSize="sm"
                          onClick={this.createExercisePipeline}
                        >
                          <AddIcon gapRight />
                          <FormattedMessage
                            id="app.exercise.createPipeline"
                            defaultMessage="Add exercise pipeline"
                          />
                        </Button>
                      </p>
                    }
                    isOpen
                  >
                    <ResourceRenderer
                      resource={exercisePipelines.toArray()}
                      returnAsArray={true}
                    >
                      {pipelines =>
                        <PipelinesSimpleList
                          pipelines={pipelines}
                          createActions={pipelineId =>
                            <div>
                              <LinkContainer
                                to={PIPELINE_EDIT_URI_FACTORY(pipelineId)}
                              >
                                <Button
                                  bsSize="xs"
                                  className="btn-flat"
                                  bsStyle="warning"
                                >
                                  <EditIcon gapRight />
                                  <FormattedMessage
                                    id="generic.edit"
                                    defaultMessage="Edit"
                                  />
                                </Button>
                              </LinkContainer>
                              <Confirm
                                id={pipelineId}
                                onConfirmed={() => deletePipeline(pipelineId)}
                                question={
                                  <FormattedMessage
                                    id="app.pipeline.deleteConfirm"
                                    defaultMessage="Are you sure you want to delete the pipeline? This cannot be undone."
                                  />
                                }
                              >
                                <Button
                                  bsSize="xs"
                                  className="btn-flat"
                                  bsStyle="danger"
                                >
                                  <DeleteIcon gapRight />
                                  <FormattedMessage
                                    id="generic.delete"
                                    defaultMessage="Delete"
                                  />
                                </Button>
                              </Confirm>
                            </div>}
                        />}
                    </ResourceRenderer>
                  </Box>
                */}
                    </Col>
                  </Row>

                  {hasPermissions(exercise, 'update') &&
                    <div className="em-margin-vertical">
                      <Row>
                        <Col sm={12}>
                          <ResourceRenderer
                            resource={[
                              exerciseConfig,
                              exerciseEnvironmentConfig
                            ]}
                          >
                            {(config, envConfig) =>
                              tests.length > 0
                                ? isSimple(exercise)
                                  ? <EditExerciseSimpleConfigForm
                                      initialValues={getSimpleConfigInitValues(
                                        config,
                                        tests,
                                        envConfig
                                      )}
                                      exercise={exercise}
                                      exerciseTests={tests}
                                      environmentsWithEntryPoints={
                                        environmentsWithEntryPoints
                                      }
                                      dataOnly={Boolean(
                                        exercise.runtimeEnvironments.find(
                                          env => env.id === 'data-linux'
                                        )
                                      )}
                                      onSubmit={this.transformAndSendConfigValuesCreator(
                                        pipelines,
                                        envConfig,
                                        tests,
                                        config
                                      )}
                                    />
                                  : <div className="callout callout-warning">
                                      EditExerciseConfigForm - TODO
                                    </div>
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
                    </div>}
                </div>}
            </ResourceRenderer>
          </div>}
      </Page>
    );
  }
}

EditExerciseConfig.propTypes = {
  exercise: ImmutablePropTypes.map,
  runtimeEnvironments: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  exerciseConfig: PropTypes.object,
  exerciseEnvironmentConfig: PropTypes.object,
  editEnvironmentConfigs: PropTypes.func.isRequired,
  exerciseScoreConfig: PropTypes.object,
  exerciseTests: PropTypes.object,
  editScoreConfig: PropTypes.func.isRequired,
  editTests: PropTypes.func.isRequired,
  fetchConfig: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  pipelines: ImmutablePropTypes.map,
  exercisePipelines: ImmutablePropTypes.map,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  reloadExercise: PropTypes.func.isRequired,
  reloadConfig: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      return {
        exercise: getExercise(exerciseId)(state),
        userId: loggedInUserIdSelector(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        exerciseConfig: exerciseConfigSelector(exerciseId)(state),
        exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(
          exerciseId
        )(state),
        exerciseScoreConfig: exerciseScoreConfigSelector(exerciseId)(state),
        exerciseTests: exerciseTestsSelector(exerciseId)(state),
        pipelines: pipelinesSelector(state),
        //        exercisePipelines: exercisePipelinesSelector(exerciseId)(state),
        environmentsWithEntryPoints: getPipelinesEnvironmentsWhichHasEntryPoint(
          state
        )
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: () => EditExerciseConfig.loadAsync({ exerciseId }, dispatch),
      editEnvironmentConfigs: data =>
        dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
      editScoreConfig: data => dispatch(setScoreConfig(exerciseId, data)),
      editTests: data => dispatch(setExerciseTests(exerciseId, data)),
      fetchConfig: () => dispatch(fetchExerciseConfig(exerciseId)),
      setConfig: data => dispatch(setExerciseConfig(exerciseId, data)),
      reloadExercise: () => dispatch(fetchExercise(exerciseId)),
      reloadConfig: () =>
        dispatch(fetchExercise(exerciseId)).then(({ value: exercise }) =>
          Promise.all([
            dispatch(fetchExerciseConfig(exerciseId)),
            dispatch(fetchExerciseEnvironmentConfig(exerciseId))
          ])
        )
    })
  )(injectIntl(EditExerciseConfig))
);
