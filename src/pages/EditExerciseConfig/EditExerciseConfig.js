import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import EditTestsForm from '../../components/forms/EditTestsForm';
import EditExerciseSimpleConfigForm from '../../components/forms/EditExerciseSimpleConfigForm';
import EditExerciseAdvancedConfigForm from '../../components/forms/EditExerciseAdvancedConfigForm';
import EditEnvironmentSimpleForm from '../../components/forms/EditEnvironmentSimpleForm';
import EditEnvironmentConfigForm from '../../components/forms/EditEnvironmentConfigForm';
import EditExercisePipelinesForm from '../../components/forms/EditExercisePipelinesForm/EditExercisePipelinesForm';
// import PipelinesSimpleList from '../../components/Pipelines/PipelinesSimpleList';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import ExerciseConfigTypeButton from '../../components/buttons/ExerciseConfigTypeButton';
import { InfoIcon, NeedFixingIcon, WarningIcon } from '../../components/icons';

import {
  fetchExercise,
  fetchExerciseIfNeeded,
  editExercise
} from '../../redux/modules/exercises';
import {
  fetchExerciseConfig,
  fetchExerciseConfigIfNeeded,
  setExerciseConfig
} from '../../redux/modules/exerciseConfigs';
import { getExercise } from '../../redux/selectors/exercises';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { fetchExercisePipelinesVariables } from '../../redux/modules/exercisePipelinesVariables';
import { getExercisePielinesVariablesJS } from '../../redux/selectors/exercisePipelinesVariables';
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
  getSimpleEnvironmentsInitValues,
  getFirstEnvironmentId,
  getEnvironmentInitValues,
  transformSimpleEnvironmentsValues,
  transformEnvironmentValues,
  getPossibleVariablesNames
} from '../../helpers/exercise/environments';
import {
  isSimple,
  SIMPLE_CONFIG_TYPE,
  ADVANCED_CONFIG_TYPE
} from '../../helpers/exercise/config';
import {
  getSimpleConfigInitValues,
  transformSimpleConfigValues,
  DATA_ONLY_ID
} from '../../helpers/exercise/configSimple';
import {
  getPipelines,
  getPipelinesInitialValues,
  assembleNewConfig,
  getAdvancedConfigInitValues,
  transformAdvancedConfigValues
} from '../../helpers/exercise/configAdvanced';
import { isEmpoweredSupervisorRole } from '../../components/helpers/usersRoles';
import { hasPermissions, safeGet } from '../../helpers/common';

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
        ({ value: exercise }) =>
          hasPermissions(exercise, 'update') &&
          Promise.all([
            dispatch(fetchExerciseConfigIfNeeded(exerciseId)),
            dispatch(fetchExerciseEnvironmentConfigIfNeeded(exerciseId)),
            dispatch(fetchRuntimeEnvironments())
          ]).then(([{ value: config }, { value: environmentConfig }]) => {
            const runtimeId = safeGet(environmentConfig, [
              0,
              'runtimeEnvironmentId'
            ]);
            const pipelinesIds = getPipelines(config);
            return runtimeId && pipelinesIds && pipelinesIds.length > 0
              ? dispatch(
                  fetchExercisePipelinesVariables(
                    exerciseId,
                    runtimeId,
                    pipelinesIds
                  )
                )
              : null;
          })
      ),
      dispatch(fetchScoreConfigIfNeeded(exerciseId)),
      dispatch(fetchExerciseTestsIfNeeded(exerciseId)),
      dispatch(fetchPipelines())
    ]);

  setConfigTypeCreator = defaultMemoize(
    (
      exercise,
      configurationType,
      pipelines,
      environments,
      tests,
      config,
      environmentConfigs
    ) => {
      const {
        setExerciseConfigType,
        editEnvironmentConfigs,
        setConfig,
        reloadConfig
      } = this.props;
      return () => {
        if (configurationType === SIMPLE_CONFIG_TYPE) {
          const newEnvironments = transformSimpleEnvironmentsValues(
            getSimpleEnvironmentsInitValues(environmentConfigs),
            [],
            environments
          );
          const configData = transformSimpleConfigValues(
            getSimpleConfigInitValues(config, tests, newEnvironments),
            pipelines,
            newEnvironments,
            tests,
            config
          );
          return editEnvironmentConfigs({
            environmentConfigs: newEnvironments
          })
            .then(() => setConfig(configData))
            .then(() => setExerciseConfigType(exercise, configurationType))
            .then(reloadConfig);
        } else {
          return setExerciseConfigType(exercise, configurationType);
        }
      };
    }
  );

  transformAndSendTestsValues = data => {
    const { editTests, editScoreConfig, reloadConfig } = this.props;
    const { tests, scoreConfig } = transformTestsValues(data);
    return Promise.all([
      editTests({ tests }),
      editScoreConfig({ scoreConfig })
    ]).then(reloadConfig);
  };

  transformAndSendConfigValuesCreator = defaultMemoize(
    (transform, ...transformArgs) => {
      const { setConfig, reloadExercise } = this.props;
      return data =>
        setConfig(transform(data, ...transformArgs)).then(reloadExercise);
    }
  );

  transformAndSendSimpleRuntimesValuesCreator = defaultMemoize(
    (pipelines, environments, tests, config, environmentConfigs) => {
      const { editEnvironmentConfigs, reloadConfig, setConfig } = this.props;

      return data => {
        const newEnvironments = transformSimpleEnvironmentsValues(
          data,
          environmentConfigs,
          environments
        );
        const configData = transformSimpleConfigValues(
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

  transformAndSendRuntimesValuesCreator = defaultMemoize((tests, config) => {
    const {
      editEnvironmentConfigs,
      fetchPipelinesVariables,
      setConfig,
      reloadConfig
    } = this.props;
    const selectedPipelines = getPipelines(config);
    return data => {
      const environmentConfigs = transformEnvironmentValues(data);
      const runtimeId = safeGet(
        environmentConfigs,
        [0, 'runtimeEnvironmentId'],
        null
      );

      const res = editEnvironmentConfigs({ environmentConfigs });
      return selectedPipelines && selectedPipelines.length > 0
        ? res
            .then(() => fetchPipelinesVariables(runtimeId, selectedPipelines))
            .then(({ value: pipelinesVariables }) =>
              setConfig(
                assembleNewConfig(config, runtimeId, tests, pipelinesVariables)
              )
            )
            .then(reloadConfig)
        : res;
    };
  });

  transformAndSendPipelinesCreator = defaultMemoize(
    (tests, config, environmentConfigs) => ({ pipelines }) => {
      const { setConfig, fetchPipelinesVariables, reloadConfig } = this.props;
      const runtimeId = safeGet(
        environmentConfigs,
        [0, 'runtimeEnvironmentId'],
        null
      );

      return fetchPipelinesVariables(runtimeId, pipelines)
        .then(({ value: pipelinesVariables }) =>
          setConfig(
            assembleNewConfig(config, runtimeId, tests, pipelinesVariables)
          )
        )
        .then(reloadConfig);
    }
  );

  render() {
    const {
      params: { exerciseId },
      exercise,
      loggedUser,
      runtimeEnvironments,
      exerciseConfig,
      exerciseEnvironmentConfig,
      exerciseScoreConfig,
      exerciseTests,
      pipelines,
      // exercisePipelines,
      environmentsWithEntryPoints,
      pipelinesVariables,
      intl: { locale },
      links: {
        EXERCISE_URI_FACTORY
        // PIPELINE_EDIT_URI_FACTORY
      }
    } = this.props;

    return (
      <Page
        resource={[exercise, exerciseTests, loggedUser]}
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
        {(exercise, tests, loggedUser) =>
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
                        <div className="callout callout-warning">
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

                  {hasPermissions(exercise, 'update') &&
                    isEmpoweredSupervisorRole(loggedUser.privateData.role) &&
                    <table className="em-margin-vertical">
                      <tbody>
                        <tr>
                          <td className="valing-middle em-padding-right">
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
                                    <ExerciseConfigTypeButton
                                      isSimple={isSimple(exercise)}
                                      setExerciseConfigType={this.setConfigTypeCreator(
                                        exercise,
                                        isSimple(exercise)
                                          ? ADVANCED_CONFIG_TYPE
                                          : SIMPLE_CONFIG_TYPE,
                                        pipelines,
                                        environments,
                                        tests,
                                        config,
                                        environmentConfigs
                                      )}
                                      disabled={
                                        isSimple(exercise) &&
                                        exercise.runtimeEnvironments.length > 1
                                      }
                                    />}
                                </ResourceRenderer>}
                            </ResourceRenderer>
                          </td>
                          <td className="em-padding-left small text-muted">
                            <InfoIcon gapRight />
                            {isSimple(exercise)
                              ? <FormattedMessage
                                  id="app.editExerciseConfig.changeConfigAdvancedExplain"
                                  defaultMessage="Changing to advanced configuration will allow you to use custom pipelines and manually configure their parameters. The exercise may also have a custom environment configuration alowing arbitrary constraints on which files are submitted by the students. A deeper understanding of the ReCodEx evaluation process is required to set the configuration correctly. Please note that advanced configurations may have only one runtime environment (so it is not possible to convert simple configurations with multiple environments set)."
                                />
                              : <FormattedMessage
                                  id="app.editExerciseConfig.changeConfigSimpleExplain"
                                  defaultMessage="Changing back to simple configuration requires that certain constraints are imposed. This may significantly alter the runtime environment configuration, pipelines selection, and exercise configuration."
                                />}
                          </td>
                        </tr>
                      </tbody>
                    </table>}

                  <Row>
                    <Col lg={6}>
                      <Box
                        title={
                          <FormattedMessage
                            id="app.editExerciseConfig.testsAndScoring"
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
                              id="app.editExerciseConfig.runtimeEnvironments"
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
                                    initialValues={getSimpleEnvironmentsInitValues(
                                      environmentConfigs
                                    )}
                                    runtimeEnvironments={environments}
                                    onSubmit={this.transformAndSendSimpleRuntimesValuesCreator(
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
                    </Col>
                    <Col lg={6}>
                      <SupplementaryFilesTableContainer exercise={exercise} />
                    </Col>
                  </Row>

                  {!isSimple(exercise) &&
                    <ResourceRenderer
                      resource={[exerciseConfig, exerciseEnvironmentConfig]}
                    >
                      {(config, environmentConfigs) =>
                        <Row>
                          <Col lg={6}>
                            <ResourceRenderer
                              resource={runtimeEnvironments.toArray()}
                              returnAsArray={true}
                            >
                              {environments =>
                                <EditEnvironmentConfigForm
                                  initialValues={getEnvironmentInitValues(
                                    environmentConfigs
                                  )}
                                  runtimeEnvironments={environments}
                                  possibleVariables={getPossibleVariablesNames(
                                    pipelines,
                                    getPipelines(config)
                                  )}
                                  readOnly={!hasPermissions(exercise, 'update')}
                                  onSubmit={this.transformAndSendRuntimesValuesCreator(
                                    tests,
                                    config
                                  )}
                                />}
                            </ResourceRenderer>
                          </Col>

                          <Col lg={6}>
                            {environmentConfigs.length === 1
                              ? <EditExercisePipelinesForm
                                  pipelines={pipelines}
                                  initialValues={getPipelinesInitialValues(
                                    config
                                  )}
                                  readOnly={!hasPermissions(exercise, 'update')}
                                  onSubmit={this.transformAndSendPipelinesCreator(
                                    tests,
                                    config,
                                    environmentConfigs
                                  )}
                                />
                              : <p className="callout callout-warning">
                                  <FormattedMessage
                                    id="app.editExerciseConfig.noRuntimes"
                                    defaultMessage="The runtime environment is not properly configured yet. A runtime must be selected before pipeline configuration becomes available."
                                  />
                                </p>}

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
                        </Row>}
                    </ResourceRenderer>}

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
                                          env => env.id === DATA_ONLY_ID
                                        )
                                      )}
                                      onSubmit={this.transformAndSendConfigValuesCreator(
                                        transformSimpleConfigValues,
                                        pipelines,
                                        envConfig,
                                        tests,
                                        config
                                      )}
                                    />
                                  : pipelinesVariables &&
                                    pipelinesVariables.length > 0
                                    ? <EditExerciseAdvancedConfigForm
                                        exerciseId={exerciseId}
                                        exerciseTests={tests}
                                        pipelines={pipelines}
                                        pipelinesVariables={pipelinesVariables}
                                        initialValues={getAdvancedConfigInitValues(
                                          config,
                                          getFirstEnvironmentId(envConfig),
                                          tests,
                                          pipelinesVariables
                                        )}
                                        onSubmit={this.transformAndSendConfigValuesCreator(
                                          transformAdvancedConfigValues,
                                          getFirstEnvironmentId(envConfig),
                                          tests,
                                          pipelinesVariables
                                        )}
                                      />
                                    : <div className="callout callout-warning">
                                        <h4>
                                          <WarningIcon gapRight />
                                          <FormattedMessage
                                            id="app.editExercise.editConfig"
                                            defaultMessage="Edit Exercise Configuration"
                                          />
                                        </h4>
                                        <FormattedMessage
                                          id="app.editExerciseConfig.noPipelines"
                                          defaultMessage="There are no pipelines selected yet. The form cannot be displayed until at least one pipeline is selected."
                                        />
                                      </div>
                                : <div className="callout callout-warning">
                                    <h4>
                                      <WarningIcon gapRight />
                                      <FormattedMessage
                                        id="app.editExercise.editConfig"
                                        defaultMessage="Edit Exercise Configuration"
                                      />
                                    </h4>
                                    <FormattedMessage
                                      id="app.editExerciseConfig.noTests"
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
  loggedUser: ImmutablePropTypes.map,
  runtimeEnvironments: PropTypes.object.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  exerciseConfig: PropTypes.object,
  exerciseEnvironmentConfig: PropTypes.object,
  exerciseScoreConfig: PropTypes.object,
  exerciseTests: PropTypes.object,
  pipelines: ImmutablePropTypes.map,
  exercisePipelines: ImmutablePropTypes.map,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  pipelinesVariables: PropTypes.array,
  links: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  loadAsync: PropTypes.func.isRequired,
  fetchPipelinesVariables: PropTypes.func.isRequired,
  setExerciseConfigType: PropTypes.func.isRequired,
  editEnvironmentConfigs: PropTypes.func.isRequired,
  editScoreConfig: PropTypes.func.isRequired,
  editTests: PropTypes.func.isRequired,
  fetchConfig: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  reloadExercise: PropTypes.func.isRequired,
  reloadConfig: PropTypes.func.isRequired
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      return {
        exercise: getExercise(exerciseId)(state),
        loggedUser: loggedInUserSelector(state),
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
        ),
        pipelinesVariables: getExercisePielinesVariablesJS(exerciseId)(state)
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: () => EditExerciseConfig.loadAsync({ exerciseId }, dispatch),
      fetchPipelinesVariables: (runtimeId, pipelinesIds) =>
        dispatch(
          fetchExercisePipelinesVariables(exerciseId, runtimeId, pipelinesIds)
        ),
      setExerciseConfigType: (exercise, configurationType) =>
        dispatch(editExercise(exercise.id, { ...exercise, configurationType })),
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
