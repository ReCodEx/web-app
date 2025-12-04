import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { lruMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { ExerciseNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ExerciseFilesTableContainer from '../../containers/ExerciseFilesTableContainer';
import EditTestsForm from '../../components/forms/EditTestsForm';
import EditExerciseSimpleConfigForm from '../../components/forms/EditExerciseSimpleConfigForm';
import EditExerciseAdvancedConfigForm from '../../components/forms/EditExerciseAdvancedConfigForm';
import EditEnvironmentSimpleForm from '../../components/forms/EditEnvironmentSimpleForm';
import EditEnvironmentConfigForm from '../../components/forms/EditEnvironmentConfigForm';
import EditExercisePipelinesForm from '../../components/forms/EditExercisePipelinesForm/EditExercisePipelinesForm.js';
import ExerciseCallouts, { exerciseCalloutsAreVisible } from '../../components/Exercises/ExerciseCallouts';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import ExerciseConfigTypeButton from '../../components/buttons/ExerciseConfigTypeButton';
import { InfoIcon, TestsIcon } from '../../components/icons';
import Callout from '../../components/widgets/Callout';

import {
  fetchExercise,
  fetchExerciseIfNeeded,
  editExercise,
  invalidateExercise,
  sendNotification,
} from '../../redux/modules/exercises.js';
import {
  fetchExerciseConfig,
  fetchExerciseConfigIfNeeded,
  setExerciseConfig,
} from '../../redux/modules/exerciseConfigs.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { fetchExercisePipelinesVariables } from '../../redux/modules/exercisePipelinesVariables.js';
import {
  fetchExerciseEnvironmentConfig,
  fetchExerciseEnvironmentConfigIfNeeded,
  setExerciseEnvironmentConfig,
} from '../../redux/modules/exerciseEnvironmentConfigs.js';
import { fetchScoreConfigIfNeeded, setScoreConfig } from '../../redux/modules/exerciseScoreConfig.js';
import { fetchExerciseTestsIfNeeded, setExerciseTests } from '../../redux/modules/exerciseTests.js';
import { fetchPipelines } from '../../redux/modules/pipelines.js';
import { exerciseTestsSelector } from '../../redux/selectors/exerciseTests.js';
import { pipelinesSelector, getPipelinesEnvironmentsWhichHasEntryPoint } from '../../redux/selectors/pipelines.js';
import { exerciseScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig.js';
import { exerciseEnvironmentConfigSelector } from '../../redux/selectors/exerciseEnvironmentConfigs.js';
import { getExercisePipelinesVariablesJS } from '../../redux/selectors/exercisePipelinesVariables.js';
import { getFilesForExercise, fetchFilesForExerciseStatus } from '../../redux/selectors/exerciseFiles.js';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments.js';
import { getExercise } from '../../redux/selectors/exercises.js';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs.js';
import { getLoggedInUserEffectiveRole } from '../../redux/selectors/users.js';
import { isLoadingState } from '../../redux/helpers/resourceManager/status.js';

import {
  getTestsInitValues,
  transformTestsValues,
  transformScoreConfig,
  UNIVERSAL_ID as UNIVERSAL_SCORE_CALCULATOR,
} from '../../helpers/exercise/testsAndScore.js';
import {
  onlySimpleEnvironments,
  getSimpleEnvironmentsInitValues,
  getFirstEnvironmentId,
  getEnvironmentInitValues,
  transformSimpleEnvironmentsValues,
  transformEnvironmentValues,
  getPossibleVariablesNames,
} from '../../helpers/exercise/environments.js';
import { isSimple, SIMPLE_CONFIG_TYPE, ADVANCED_CONFIG_TYPE } from '../../helpers/exercise/config.js';
import {
  getSimpleConfigInitValues,
  transformSimpleConfigValues,
  extractUsedFilesFromConfig,
} from '../../helpers/exercise/configSimple.js';
import {
  getPipelines,
  getPipelinesInitialValues,
  assembleNewConfig,
  getAdvancedConfigInitValues,
  transformAdvancedConfigValues,
} from '../../helpers/exercise/configAdvanced.js';
import { isEmpoweredSupervisorRole } from '../../components/helpers/usersRoles.js';
import { hasPermissions, safeGet } from '../../helpers/common.js';
import withRouter, { withRouterProps } from '../../helpers/withRouter.js';
import withLinks from '../../helpers/withLinks.js';

class EditExerciseConfig extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.exerciseId !== prevProps.params.exerciseId) {
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)).then(
        ({ value: exercise }) =>
          hasPermissions(exercise, 'viewConfig') &&
          Promise.all([
            dispatch(fetchExerciseConfigIfNeeded(exerciseId)),
            dispatch(fetchExerciseEnvironmentConfigIfNeeded(exerciseId)),
            dispatch(fetchRuntimeEnvironments()),
          ]).then(([{ value: config }, { value: environmentConfig }]) => {
            const runtimeId = safeGet(environmentConfig, [0, 'runtimeEnvironmentId']);
            const pipelinesIds = getPipelines(config);
            return runtimeId && pipelinesIds && pipelinesIds.length > 0
              ? dispatch(fetchExercisePipelinesVariables(exerciseId, runtimeId, pipelinesIds))
              : null;
          })
      ),
      dispatch(fetchScoreConfigIfNeeded(exerciseId)),
      dispatch(fetchExerciseTestsIfNeeded(exerciseId)),
      dispatch(fetchPipelines()),
    ]);

  setConfigTypeCreator = lruMemoize(
    (exercise, configurationType, pipelines, environments, tests, config, environmentConfigs) => {
      const { setExerciseConfigType, editEnvironmentConfigs, setConfig, reloadConfig } = this.props;
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
            environmentConfigs: newEnvironments,
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

  removeUrlHash = () => {
    const {
      navigate,
      location: { pathname, search, hash },
    } = this.props;
    if (hash) {
      navigate(pathname + search, { replace: true });
    }
  };

  scoreConfigExtraData = null; // data kept outside redux-form (for technical reasons) but required for submission

  registerScoreConfigExtraData = data => {
    this.scoreConfigExtraData = data;
  };

  transformAndSendTestsValues = lruMemoize(originalCalculator => data => {
    this.removeUrlHash();

    const { editTests, editScoreConfig, reloadConfig, invalidateExercise } = this.props;
    const tests = transformTestsValues(data);
    const scoreCalculator = data.calculator;
    const scoreConfig = transformScoreConfig(tests, originalCalculator, data, this.scoreConfigExtraData);

    // calculator may be changed only when the rest of the for is not dirty (tests do not have to be updated)
    invalidateExercise();
    const resPromise =
      originalCalculator !== scoreCalculator
        ? editScoreConfig({ scoreCalculator, scoreConfig })
        : editTests({ tests }).then(() => editScoreConfig({ scoreCalculator, scoreConfig }));

    this.scoreConfigExtraData = null;
    return resPromise.then(reloadConfig);
  });

  transformAndSendConfigValuesCreator = lruMemoize((transform, ...transformArgs) => {
    const { setConfig, reloadExercise } = this.props;
    return data => {
      this.removeUrlHash();
      return setConfig(transform(data, ...transformArgs)).then(reloadExercise);
    };
  });

  transformAndSendSimpleRuntimesValuesCreator = lruMemoize(
    (pipelines, environments, tests, config, environmentConfigs) => {
      const { editEnvironmentConfigs, reloadConfig, setConfig } = this.props;

      return data => {
        this.removeUrlHash();
        const newEnvironments = transformSimpleEnvironmentsValues(data, environmentConfigs, environments);
        const configData = transformSimpleConfigValues(
          getSimpleConfigInitValues(config, tests, environmentConfigs),
          pipelines,
          newEnvironments,
          tests,
          config
        );
        return editEnvironmentConfigs({
          environmentConfigs: newEnvironments,
        })
          .then(() => setConfig(configData))
          .then(reloadConfig);
      };
    }
  );

  transformAndSendRuntimesValuesCreator = lruMemoize((tests, config) => {
    const { editEnvironmentConfigs, fetchPipelinesVariables, setConfig, reloadConfig } = this.props;
    const selectedPipelines = getPipelines(config);
    return data => {
      this.removeUrlHash();
      const environmentConfigs = transformEnvironmentValues(data);
      const runtimeId = safeGet(environmentConfigs, [0, 'runtimeEnvironmentId'], null);

      const res = editEnvironmentConfigs({ environmentConfigs });
      return selectedPipelines && selectedPipelines.length > 0
        ? res
            .then(() => fetchPipelinesVariables(runtimeId, selectedPipelines))
            .then(({ value: pipelinesVariables }) =>
              setConfig(assembleNewConfig(config, runtimeId, tests, pipelinesVariables))
            )
            .then(reloadConfig)
        : res;
    };
  });

  transformAndSendPipelinesCreator = lruMemoize((tests, config, environmentConfigs) => ({ pipelines }) => {
    this.removeUrlHash();
    const { setConfig, fetchPipelinesVariables, reloadConfig } = this.props;
    const runtimeId = safeGet(environmentConfigs, [0, 'runtimeEnvironmentId'], null);

    return fetchPipelinesVariables(runtimeId, pipelines)
      .then(({ value: pipelinesVariables }) =>
        setConfig(assembleNewConfig(config, runtimeId, tests, pipelinesVariables))
      )
      .then(reloadConfig);
  });

  renderTestsAndScoreBox(exercise, tests, scoreConfig) {
    return (
      <EditTestsForm
        calculator={scoreConfig && scoreConfig.calculator}
        readOnly={!hasPermissions(exercise, 'setScoreConfig')}
        initialValues={getTestsInitValues(tests, scoreConfig, this.props.intl.locale)}
        onSubmit={this.transformAndSendTestsValues(scoreConfig && scoreConfig.calculator)}
        registerExtraData={this.registerScoreConfigExtraData}
      />
    );
  }

  render() {
    const {
      params: { exerciseId },
      exercise,
      effectiveRole,
      runtimeEnvironments,
      exerciseConfig,
      exerciseEnvironmentConfig,
      exerciseScoreConfig,
      exerciseTests,
      pipelines,
      environmentsWithEntryPoints,
      pipelinesVariables,
      exerciseFiles,
      exerciseFilesStatus,
      sendNotification,
    } = this.props;

    return (
      <Page
        resource={[exercise, exerciseTests]}
        icon={<TestsIcon />}
        title={
          <FormattedMessage id="app.editExerciseConfig.title" defaultMessage="Change Exercise Tests Configuration" />
        }>
        {(exercise, tests) => (
          <div>
            <ExerciseNavigation exercise={exercise} />

            <ResourceRenderer resourceArray={pipelines}>
              {(
                pipelines // pipelines are returned as a whole array (so they can be cached properly)
              ) => (
                <div>
                  {exerciseCalloutsAreVisible(exercise) && (
                    <Row>
                      <Col sm={12}>
                        <ExerciseCallouts {...exercise} />
                      </Col>
                    </Row>
                  )}

                  <ExerciseButtons {...exercise} sendNotification={sendNotification} />

                  {hasPermissions(exercise, 'update') && isEmpoweredSupervisorRole(effectiveRole) && (
                    <table className="my-3">
                      <tbody>
                        <tr>
                          <td className="valing-middle pe-3">
                            <ResourceRenderer resource={[exerciseConfig, exerciseEnvironmentConfig]}>
                              {(config, environmentConfigs) => (
                                <ResourceRenderer resourceArray={runtimeEnvironments}>
                                  {environments => (
                                    <ExerciseConfigTypeButton
                                      isSimple={isSimple(exercise)}
                                      setExerciseConfigType={this.setConfigTypeCreator(
                                        exercise,
                                        isSimple(exercise) ? ADVANCED_CONFIG_TYPE : SIMPLE_CONFIG_TYPE,
                                        pipelines,
                                        environments,
                                        tests,
                                        config,
                                        environmentConfigs
                                      )}
                                      disabled={isSimple(exercise) && exercise.runtimeEnvironments.length > 1}
                                    />
                                  )}
                                </ResourceRenderer>
                              )}
                            </ResourceRenderer>
                          </td>
                          <td className="ps-3 small text-body-secondary">
                            <InfoIcon gapRight={2} />
                            {isSimple(exercise) ? (
                              <FormattedMessage
                                id="app.editExerciseConfig.changeConfigAdvancedExplain"
                                defaultMessage="Changing to advanced configuration will allow you to use custom pipelines and manually configure their parameters. The exercise may also have a custom environment configuration allowing arbitrary constraints on which files are submitted by the students. A deeper understanding of the ReCodEx evaluation process is required to set the configuration correctly. Please note that advanced configurations may have only one runtime environment (so it is not possible to convert simple configurations with multiple environments set)."
                              />
                            ) : (
                              <FormattedMessage
                                id="app.editExerciseConfig.changeConfigSimpleExplain"
                                defaultMessage="Changing back to simple configuration requires that certain constraints are imposed. This may significantly alter the runtime environment configuration, pipelines selection, and exercise configuration."
                              />
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  <ResourceRenderer resource={exerciseScoreConfig}>
                    {scoreConfig => (
                      <>
                        {scoreConfig && scoreConfig.calculator === UNIVERSAL_SCORE_CALCULATOR && (
                          <Row>
                            <Col lg={12}>{this.renderTestsAndScoreBox(exercise, tests, scoreConfig)}</Col>
                          </Row>
                        )}

                        <ResourceRenderer resource={exerciseConfig}>
                          {config => (
                            <Row>
                              <Col lg={6}>
                                {scoreConfig &&
                                  scoreConfig.calculator !== UNIVERSAL_SCORE_CALCULATOR &&
                                  this.renderTestsAndScoreBox(exercise, tests, scoreConfig)}

                                {isSimple(exercise) && hasPermissions(exercise, 'viewConfig') && (
                                  <ResourceRenderer resource={exerciseEnvironmentConfig}>
                                    {environmentConfigs => (
                                      <ResourceRenderer
                                        resourceArray={runtimeEnvironments}
                                        forceLoading={runtimeEnvironments.size === 0}>
                                        {environments => (
                                          <EditEnvironmentSimpleForm
                                            readOnly={!hasPermissions(exercise, 'update')}
                                            initialValues={getSimpleEnvironmentsInitValues(environmentConfigs)}
                                            runtimeEnvironments={onlySimpleEnvironments(environments)}
                                            onSubmit={this.transformAndSendSimpleRuntimesValuesCreator(
                                              pipelines,
                                              environments,
                                              tests,
                                              config,
                                              environmentConfigs
                                            )}
                                          />
                                        )}
                                      </ResourceRenderer>
                                    )}
                                  </ResourceRenderer>
                                )}
                              </Col>
                              <Col lg={6}>
                                <ExerciseFilesTableContainer
                                  exercise={exercise}
                                  usedFiles={extractUsedFilesFromConfig(config)}
                                />
                              </Col>
                            </Row>
                          )}
                        </ResourceRenderer>
                      </>
                    )}
                  </ResourceRenderer>

                  {!isSimple(exercise) && (
                    <ResourceRenderer resource={[exerciseConfig, exerciseEnvironmentConfig]}>
                      {(config, environmentConfigs) => (
                        <Row>
                          <Col lg={6}>
                            <ResourceRenderer resourceArray={runtimeEnvironments}>
                              {environments => (
                                <EditEnvironmentConfigForm
                                  initialValues={getEnvironmentInitValues(environmentConfigs)}
                                  runtimeEnvironments={environments}
                                  possibleVariables={getPossibleVariablesNames(pipelines, getPipelines(config))}
                                  firstTimeSelection={getFirstEnvironmentId(environmentConfigs) === null}
                                  readOnly={!hasPermissions(exercise, 'update')}
                                  onSubmit={this.transformAndSendRuntimesValuesCreator(tests, config)}
                                />
                              )}
                            </ResourceRenderer>
                          </Col>

                          <Col lg={6}>
                            {environmentConfigs.length === 1 && tests.length > 0 ? (
                              <EditExercisePipelinesForm
                                pipelines={pipelines}
                                initialValues={getPipelinesInitialValues(config)}
                                readOnly={!hasPermissions(exercise, 'update')}
                                onSubmit={this.transformAndSendPipelinesCreator(tests, config, environmentConfigs)}
                              />
                            ) : (
                              <Callout variant="warning">
                                <h4>
                                  <FormattedMessage
                                    id="app.editExercisePipelines.title"
                                    defaultMessage="Selected Pipelines"
                                  />
                                </h4>
                                <ul className="ps-3">
                                  {environmentConfigs.length !== 1 && (
                                    <li>
                                      <FormattedMessage
                                        id="app.editExerciseConfig.noRuntimes"
                                        defaultMessage="The runtime environment is not properly configured yet."
                                      />
                                    </li>
                                  )}
                                  {tests.length === 0 && (
                                    <li>
                                      <FormattedMessage
                                        id="app.editExerciseConfig.noTests"
                                        defaultMessage="There are no tests yet."
                                      />
                                    </li>
                                  )}
                                </ul>
                                <p>
                                  <FormattedMessage
                                    id="app.editExerciseConfig.cannotDisplayPipelinesForm"
                                    defaultMessage="The tests and runtime environment must be correctly defined before the pipeline configuration becomes available."
                                  />
                                </p>
                              </Callout>
                            )}
                          </Col>
                        </Row>
                      )}
                    </ResourceRenderer>
                  )}

                  {hasPermissions(exercise, 'viewConfig') && (
                    <div className="my-3">
                      <Row>
                        <Col sm={12}>
                          <ResourceRenderer resource={[exerciseConfig, exerciseEnvironmentConfig]}>
                            {(config, envConfig) => (
                              <ResourceRenderer
                                resourceArray={exerciseFiles}
                                forceLoading={isLoadingState(exerciseFilesStatus)}>
                                {files =>
                                  tests.length > 0 ? (
                                    isSimple(exercise) ? (
                                      <EditExerciseSimpleConfigForm
                                        readOnly={!hasPermissions(exercise, 'update')}
                                        initialValues={getSimpleConfigInitValues(config, tests, envConfig)}
                                        exercise={exercise}
                                        exerciseTests={tests}
                                        environmentsWithEntryPoints={environmentsWithEntryPoints}
                                        exerciseFiles={files}
                                        onSubmit={this.transformAndSendConfigValuesCreator(
                                          transformSimpleConfigValues,
                                          pipelines,
                                          envConfig,
                                          tests,
                                          config
                                        )}
                                      />
                                    ) : pipelinesVariables && pipelinesVariables.length > 0 ? (
                                      <EditExerciseAdvancedConfigForm
                                        readOnly={!hasPermissions(exercise, 'update')}
                                        exerciseId={exerciseId}
                                        exerciseTests={tests}
                                        pipelines={pipelines}
                                        pipelinesVariables={pipelinesVariables}
                                        exerciseFiles={files}
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
                                    ) : (
                                      <Callout variant="warning">
                                        <h4>
                                          <FormattedMessage
                                            id="app.editExercise.editConfig"
                                            defaultMessage="Exercise Configuration"
                                          />
                                        </h4>
                                        <FormattedMessage
                                          id="app.editExerciseConfig.noPipelines"
                                          defaultMessage="There are no pipelines selected yet. The form cannot be displayed until at least one pipeline is selected."
                                        />
                                      </Callout>
                                    )
                                  ) : (
                                    <Callout variant="warning">
                                      <h4>
                                        <FormattedMessage
                                          id="app.editExercise.editConfig"
                                          defaultMessage="Exercise Configuration"
                                        />
                                      </h4>
                                      <FormattedMessage
                                        id="app.editExerciseConfig.noTests"
                                        defaultMessage="There are no tests yet."
                                      />
                                      <FormattedMessage
                                        id="app.editExerciseConfig.cannotDisplayConfigForm"
                                        defaultMessage="The exercise configuration form cannot be displayed until at least one test is defined."
                                      />
                                    </Callout>
                                  )
                                }
                              </ResourceRenderer>
                            )}
                          </ResourceRenderer>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              )}
            </ResourceRenderer>
          </div>
        )}
      </Page>
    );
  }
}

EditExerciseConfig.propTypes = {
  exercise: ImmutablePropTypes.map,
  effectiveRole: PropTypes.string,
  runtimeEnvironments: ImmutablePropTypes.map.isRequired,
  exerciseConfig: PropTypes.object,
  exerciseEnvironmentConfig: PropTypes.object,
  exerciseScoreConfig: ImmutablePropTypes.map,
  exerciseTests: PropTypes.object,
  pipelines: ImmutablePropTypes.map,
  exercisePipelines: ImmutablePropTypes.map,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  pipelinesVariables: PropTypes.array,
  exerciseFiles: ImmutablePropTypes.map,
  exerciseFilesStatus: PropTypes.string,
  links: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  fetchPipelinesVariables: PropTypes.func.isRequired,
  setExerciseConfigType: PropTypes.func.isRequired,
  editEnvironmentConfigs: PropTypes.func.isRequired,
  editScoreConfig: PropTypes.func.isRequired,
  editTests: PropTypes.func.isRequired,
  fetchConfig: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  reloadExercise: PropTypes.func.isRequired,
  reloadConfig: PropTypes.func.isRequired,
  invalidateExercise: PropTypes.func.isRequired,
  sendNotification: PropTypes.func.isRequired,
  navigate: withRouterProps.navigate,
  location: withRouterProps.location,
  params: PropTypes.shape({ exerciseId: PropTypes.string }).isRequired,
};

export default withRouter(
  withLinks(
    connect(
      (state, { params: { exerciseId } }) => {
        return {
          exercise: getExercise(exerciseId)(state),
          effectiveRole: getLoggedInUserEffectiveRole(state),
          runtimeEnvironments: runtimeEnvironmentsSelector(state),
          exerciseConfig: exerciseConfigSelector(exerciseId)(state),
          exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(exerciseId)(state),
          exerciseScoreConfig: exerciseScoreConfigSelector(state, exerciseId),
          exerciseTests: exerciseTestsSelector(exerciseId)(state),
          pipelines: pipelinesSelector(state),
          environmentsWithEntryPoints: getPipelinesEnvironmentsWhichHasEntryPoint(state),
          pipelinesVariables: getExercisePipelinesVariablesJS(exerciseId)(state),
          exerciseFiles: getFilesForExercise(exerciseId)(state),
          exerciseFilesStatus: fetchFilesForExerciseStatus(state)(exerciseId),
        };
      },
      (dispatch, { params: { exerciseId } }) => ({
        loadAsync: () => EditExerciseConfig.loadAsync({ exerciseId }, dispatch),
        fetchPipelinesVariables: (runtimeId, pipelinesIds) =>
          dispatch(fetchExercisePipelinesVariables(exerciseId, runtimeId, pipelinesIds)),
        setExerciseConfigType: (exercise, configurationType) =>
          dispatch(editExercise(exercise.id, { ...exercise, configurationType })),
        editEnvironmentConfigs: data => dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
        editScoreConfig: data => dispatch(setScoreConfig(exerciseId, data)),
        editTests: data => dispatch(setExerciseTests(exerciseId, data)),
        fetchConfig: () => dispatch(fetchExerciseConfig(exerciseId)),
        setConfig: data => dispatch(setExerciseConfig(exerciseId, data)),
        reloadExercise: () => dispatch(fetchExercise(exerciseId)),
        reloadConfig: () =>
          dispatch(fetchExercise(exerciseId)).then(() =>
            Promise.all([
              dispatch(fetchExerciseConfig(exerciseId)),
              dispatch(fetchExerciseEnvironmentConfig(exerciseId)),
            ])
          ),
        invalidateExercise: () => dispatch(invalidateExercise(exerciseId)),
        sendNotification: message => dispatch(sendNotification(exerciseId, message)),
      })
    )(injectIntl(EditExerciseConfig))
  )
);
