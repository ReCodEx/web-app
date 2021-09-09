import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { ExerciseNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import EditTestsForm from '../../components/forms/EditTestsForm';
import EditExerciseSimpleConfigForm from '../../components/forms/EditExerciseSimpleConfigForm';
import EditExerciseAdvancedConfigForm from '../../components/forms/EditExerciseAdvancedConfigForm';
import EditEnvironmentSimpleForm from '../../components/forms/EditEnvironmentSimpleForm';
import EditEnvironmentConfigForm from '../../components/forms/EditEnvironmentConfigForm';
import EditExercisePipelinesForm from '../../components/forms/EditExercisePipelinesForm/EditExercisePipelinesForm';
// import PipelinesSimpleList from '../../components/Pipelines/PipelinesSimpleList';
import ExerciseCallouts, { exerciseCalloutsAreVisible } from '../../components/Exercises/ExerciseCallouts';
import ExerciseConfigTypeButton from '../../components/buttons/ExerciseConfigTypeButton';
import { InfoIcon, TestsIcon } from '../../components/icons';
import Callout from '../../components/widgets/Callout';

import { fetchExercise, fetchExerciseIfNeeded, editExercise, invalidateExercise } from '../../redux/modules/exercises';
import {
  fetchExerciseConfig,
  fetchExerciseConfigIfNeeded,
  setExerciseConfig,
} from '../../redux/modules/exerciseConfigs';
import { getExercise } from '../../redux/selectors/exercises';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { getLoggedInUserEffectiveRole } from '../../redux/selectors/users';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { fetchExercisePipelinesVariables } from '../../redux/modules/exercisePipelinesVariables';
import { getExercisePielinesVariablesJS } from '../../redux/selectors/exercisePipelinesVariables';
import {
  getSupplementaryFilesForExercise,
  fetchSupplementaryFilesForExerciseStatus,
} from '../../redux/selectors/supplementaryFiles';
import { isLoadingState } from '../../redux/helpers/resourceManager/status';

/*
import {
  deletePipeline,
  fetchExercisePipelines
} from '../../redux/modules/pipelines';
import { exercisePipelinesSelector } from '../../redux/selectors/pipelines';
*/

import withLinks from '../../helpers/withLinks';
import { exerciseEnvironmentConfigSelector } from '../../redux/selectors/exerciseEnvironmentConfigs';
import {
  fetchExerciseEnvironmentConfig,
  fetchExerciseEnvironmentConfigIfNeeded,
  setExerciseEnvironmentConfig,
} from '../../redux/modules/exerciseEnvironmentConfigs';
import { exerciseScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig';
import { fetchScoreConfigIfNeeded, setScoreConfig } from '../../redux/modules/exerciseScoreConfig';
import { fetchExerciseTestsIfNeeded, setExerciseTests } from '../../redux/modules/exerciseTests';
import { exerciseTestsSelector } from '../../redux/selectors/exerciseTests';
import { fetchPipelines } from '../../redux/modules/pipelines';
import { pipelinesSelector, getPipelinesEnvironmentsWhichHasEntryPoint } from '../../redux/selectors/pipelines';

import {
  getTestsInitValues,
  transformTestsValues,
  transformScoreConfig,
  UNIVERSAL_ID as UNIVERSAL_SCORE_CALCULATOR,
} from '../../helpers/exercise/testsAndScore';
import {
  onlySimpleEnvironments,
  getSimpleEnvironmentsInitValues,
  getFirstEnvironmentId,
  getEnvironmentInitValues,
  transformSimpleEnvironmentsValues,
  transformEnvironmentValues,
  getPossibleVariablesNames,
} from '../../helpers/exercise/environments';
import { isSimple, SIMPLE_CONFIG_TYPE, ADVANCED_CONFIG_TYPE } from '../../helpers/exercise/config';
import {
  getSimpleConfigInitValues,
  transformSimpleConfigValues,
  extractUsedFilesFromConfig,
} from '../../helpers/exercise/configSimple';
import {
  getPipelines,
  getPipelinesInitialValues,
  assembleNewConfig,
  getAdvancedConfigInitValues,
  transformAdvancedConfigValues,
} from '../../helpers/exercise/configAdvanced';
import { isEmpoweredSupervisorRole } from '../../components/helpers/usersRoles';
import { hasPermissions, safeGet } from '../../helpers/common';

class EditExerciseConfig extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.exerciseId !== prevProps.match.params.exerciseId) {
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

  setConfigTypeCreator = defaultMemoize(
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
      history: { replace },
      location: { pathname, search, hash },
    } = this.props;
    if (hash) {
      replace(pathname + search);
    }
  };

  scoreConfigExtraData = null; // data kept oustide redux-form (for technical reasons) but required for submission

  registerScoreConfigExtraData = data => {
    this.scoreConfigExtraData = data;
  };

  transformAndSendTestsValues = defaultMemoize(originalCalculator => data => {
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

  transformAndSendConfigValuesCreator = defaultMemoize((transform, ...transformArgs) => {
    const { setConfig, reloadExercise } = this.props;
    return data => {
      this.removeUrlHash();
      return setConfig(transform(data, ...transformArgs)).then(reloadExercise);
    };
  });

  transformAndSendSimpleRuntimesValuesCreator = defaultMemoize(
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

  transformAndSendRuntimesValuesCreator = defaultMemoize((tests, config) => {
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

  transformAndSendPipelinesCreator = defaultMemoize((tests, config, environmentConfigs) => ({ pipelines }) => {
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
      match: {
        params: { exerciseId },
      },
      exercise,
      effectiveRole,
      runtimeEnvironments,
      exerciseConfig,
      exerciseEnvironmentConfig,
      exerciseScoreConfig,
      exerciseTests,
      pipelines,
      // exercisePipelines,
      environmentsWithEntryPoints,
      pipelinesVariables,
      supplementaryFiles,
      supplementaryFilesStatus,
      // links: {
      // PIPELINE_EDIT_URI_FACTORY
      // },
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
            <ExerciseNavigation
              exerciseId={exercise.id}
              canEdit={hasPermissions(exercise, 'update')}
              canViewTests={hasPermissions(exercise, 'viewPipelines', 'viewScoreConfig')}
              canViewLimits={hasPermissions(exercise, 'viewLimits')}
              canViewAssignments={hasPermissions(exercise, 'viewAssignments')}
            />

            <ResourceRenderer resource={pipelines.toArray()} returnAsArray={true}>
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

                  {hasPermissions(exercise, 'update') && isEmpoweredSupervisorRole(effectiveRole) && (
                    <table className="em-margin-vertical">
                      <tbody>
                        <tr>
                          <td className="valing-middle em-padding-right">
                            <ResourceRenderer resource={[exerciseConfig, exerciseEnvironmentConfig]}>
                              {(config, environmentConfigs) => (
                                <ResourceRenderer resource={runtimeEnvironments.toArray()} returnAsArray={true}>
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
                          <td className="em-padding-left small text-muted">
                            <InfoIcon gapRight />
                            {isSimple(exercise) ? (
                              <FormattedMessage
                                id="app.editExerciseConfig.changeConfigAdvancedExplain"
                                defaultMessage="Changing to advanced configuration will allow you to use custom pipelines and manually configure their parameters. The exercise may also have a custom environment configuration alowing arbitrary constraints on which files are submitted by the students. A deeper understanding of the ReCodEx evaluation process is required to set the configuration correctly. Please note that advanced configurations may have only one runtime environment (so it is not possible to convert simple configurations with multiple environments set)."
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
                                        resource={runtimeEnvironments.toArray()}
                                        returnAsArray
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
                                <SupplementaryFilesTableContainer
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
                            <ResourceRenderer resource={runtimeEnvironments.toArray()} returnAsArray>
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
                                <ul className="em-padding-left">
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
                          variant="success"
                          size="sm"
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
                              <Link
                                to={PIPELINE_EDIT_URI_FACTORY(pipelineId)}
                              >
                                <Button
                                  size="xs"
                                  variant="warning"
                                >
                                  <EditIcon gapRight />
                                  <FormattedMessage
                                    id="generic.edit"
                                    defaultMessage="Edit"
                                  />
                                </Button>
                              </Link>
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
                                  size="xs"
                                  variant="danger"
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
                      )}
                    </ResourceRenderer>
                  )}

                  {hasPermissions(exercise, 'viewConfig') && (
                    <div className="em-margin-vertical">
                      <Row>
                        <Col sm={12}>
                          <ResourceRenderer resource={[exerciseConfig, exerciseEnvironmentConfig]}>
                            {(config, envConfig) => (
                              <ResourceRenderer
                                resource={supplementaryFiles.toArray()}
                                returnAsArray
                                forceLoading={isLoadingState(supplementaryFilesStatus)}>
                                {files =>
                                  tests.length > 0 ? (
                                    isSimple(exercise) ? (
                                      <EditExerciseSimpleConfigForm
                                        readOnly={!hasPermissions(exercise, 'update')}
                                        initialValues={getSimpleConfigInitValues(config, tests, envConfig)}
                                        exercise={exercise}
                                        exerciseTests={tests}
                                        environmentsWithEntryPoints={environmentsWithEntryPoints}
                                        supplementaryFiles={files}
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
                                        supplementaryFiles={files}
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      exerciseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  exerciseConfig: PropTypes.object,
  exerciseEnvironmentConfig: PropTypes.object,
  exerciseScoreConfig: ImmutablePropTypes.map,
  exerciseTests: PropTypes.object,
  pipelines: ImmutablePropTypes.map,
  exercisePipelines: ImmutablePropTypes.map,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  pipelinesVariables: PropTypes.array,
  supplementaryFiles: ImmutablePropTypes.map,
  supplementaryFilesStatus: PropTypes.string,
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
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { exerciseId },
        },
      }
    ) => {
      return {
        exercise: getExercise(exerciseId)(state),
        effectiveRole: getLoggedInUserEffectiveRole(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        exerciseConfig: exerciseConfigSelector(exerciseId)(state),
        exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(exerciseId)(state),
        exerciseScoreConfig: exerciseScoreConfigSelector(state, exerciseId),
        exerciseTests: exerciseTestsSelector(exerciseId)(state),
        pipelines: pipelinesSelector(state),
        //        exercisePipelines: exercisePipelinesSelector(exerciseId)(state),
        environmentsWithEntryPoints: getPipelinesEnvironmentsWhichHasEntryPoint(state),
        pipelinesVariables: getExercisePielinesVariablesJS(exerciseId)(state),
        supplementaryFiles: getSupplementaryFilesForExercise(exerciseId)(state),
        supplementaryFilesStatus: fetchSupplementaryFilesForExerciseStatus(state)(exerciseId),
      };
    },
    (
      dispatch,
      {
        match: {
          params: { exerciseId },
        },
      }
    ) => ({
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
          Promise.all([dispatch(fetchExerciseConfig(exerciseId)), dispatch(fetchExerciseEnvironmentConfig(exerciseId))])
        ),
      invalidateExercise: () => dispatch(invalidateExercise(exerciseId)),
    })
  )(injectIntl(withRouter(EditExerciseConfig)))
);
