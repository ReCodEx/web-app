import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import yaml from 'js-yaml';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import EditSimpleLimitsBox from '../../components/Exercises/EditSimpleLimitsBox';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import EditTestsForm from '../../components/forms/EditTestsForm';
import EditExerciseSimpleConfigForm from '../../components/forms/EditExerciseSimpleConfigForm';
import EditEnvironmentSimpleForm from '../../components/forms/EditEnvironmentSimpleForm';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import {
  fetchExerciseEnvironmentSimpleLimitsIfNeeded,
  editEnvironmentSimpleLimits,
  setHorizontally,
  setVertically,
  setAll
} from '../../redux/modules/simpleLimits';
import { fetchExerciseConfigIfNeeded } from '../../redux/modules/exerciseConfigs';
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

const getEnvInitValues = environmentConfigs => {
  let res = {};
  for (const env of environmentConfigs) {
    res[env.runtimeEnvironmentId] = true;
  }
  return res;
};

const transformAndSendEnvValues = (
  formData,
  environments,
  editEnvironmentConfigs
) => {
  let res = [];
  for (const env in formData) {
    if (formData[env] !== true && formData[env] !== 'true') {
      continue;
    }
    let envObj = { runtimeEnvironmentId: env };
    const currentFullEnv = environments.find(e => e.id === env);
    envObj.variablesTable = currentFullEnv.defaultVariables;
    res.push(envObj);
  }
  return editEnvironmentConfigs({ environmentConfigs: res });
};

const getTestsInitValues = (exerciseTests, scoreConfig, locale) => {
  const jsonScoreConfig = yaml.safeLoad(scoreConfig);
  const testWeights = jsonScoreConfig.testWeights || {};
  const sortedTests = exerciseTests.sort((a, b) =>
    a.name.localeCompare(b.name, locale)
  );

  let res = [];
  let allWeightsSame = true;
  let lastWeight = null;
  for (const test of sortedTests) {
    const testWeight = testWeights[test.name] || 100;
    if (lastWeight !== null && testWeight !== lastWeight) {
      allWeightsSame = false;
    }
    lastWeight = testWeight;
    res.push({ name: test.name, weight: testWeight });
  }

  return { isUniform: allWeightsSame, tests: res };
};

const transformAndSendTestsValues = (
  formData,
  editExerciseTests,
  editExerciseScoreConfig
) => {
  const uniformScore =
    formData.isUniform === true || formData.isUniform === 'true';
  let scoreConfigData = { testWeights: {} };
  let testsData = [];

  for (const test of formData.tests) {
    const testWeight = uniformScore ? 100 : Number(test.weight);
    scoreConfigData.testWeights[test.name] = testWeight;

    testsData.push({ name: test.name });
  }

  return Promise.all([
    editExerciseTests({ tests: testsData }),
    editExerciseScoreConfig({ scoreConfig: yaml.safeDump(scoreConfigData) })
  ]);
};

const getSimpleConfigInitValues = (config, tests, locale) => {
  const confTests = config[0].tests.sort((a, b) =>
    a.name.localeCompare(b.name, locale)
  );

  let res = [];
  for (let test of confTests) {
    let testObj = { name: test.name };
    const variables = test.pipelines.reduce(
      (acc, pipeline) => acc.concat(pipeline.variables),
      []
    );

    const inputFiles = variables.find(
      variable => variable.name === 'input-files'
    );
    const actualInputs = variables.find(
      variable => variable.name === 'actual-inputs'
    );
    if (inputFiles) {
      testObj.inputFiles = inputFiles.value.map((value, i) => ({
        first: value,
        second:
          actualInputs && actualInputs.value && actualInputs.value[i]
            ? actualInputs.value[i]
            : ''
      }));
    }

    const expectedOutput = variables.find(
      variable => variable.name === 'expected-output'
    );
    if (expectedOutput) {
      testObj.expectedOutput = expectedOutput.value;
    }

    const runArgs = variables.find(variable => variable.name === 'run-args');
    if (runArgs) {
      testObj.runArgs = runArgs.value;
    }

    const actualOutput = variables.find(
      variable => variable.name === 'actual-output'
    );
    if (actualOutput) {
      testObj.useOutFile = true;
      testObj.outputFile = actualOutput.value;
    }

    const stdinFile = variables.find(
      variable => variable.name === 'stdin-file'
    );
    if (stdinFile) {
      testObj.inputStdin = stdinFile.value;
    }

    const standardJudge = variables.find(
      variable => variable.name === 'judge-type'
    );
    if (standardJudge) {
      testObj.useCustomJudge = false;
      testObj.judgeBinary = standardJudge.value;
    }

    const customJudge = variables.find(
      variable => variable.name === 'custom-judge'
    );
    if (customJudge) {
      testObj.customJudgeBinary = customJudge.value;
      testObj.useCustomJudge = customJudge.value.trim() !== '';
    }

    const judgeArgs = variables.find(
      variable => variable.name === 'judge-args'
    );
    if (judgeArgs) {
      testObj.judgeArgs = judgeArgs.value;
    }

    res.push(testObj);
  }

  return { config: res };
};

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
      dispatch(fetchRuntimeEnvironments())
    ]);

  render() {
    const {
      links: { EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      runtimeEnvironments,
      exerciseConfig,
      editEnvironmentSimpleLimits,
      exerciseEnvironmentConfig,
      editEnvironmentConfigs,
      exerciseScoreConfig,
      exerciseTests,
      editScoreConfig,
      editTests,
      limits,
      setHorizontally,
      setVertically,
      setAll,
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
                    resource={[...runtimeEnvironments.toArray()]}
                  >
                    {(...environments) =>
                      <ResourceRenderer resource={exerciseEnvironmentConfig}>
                        {environmentConfigs =>
                          <EditEnvironmentSimpleForm
                            initialValues={getEnvInitValues(environmentConfigs)}
                            runtimeEnvironments={environments}
                            onSubmit={data =>
                              transformAndSendEnvValues(
                                data,
                                environments,
                                editEnvironmentConfigs
                              )}
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
                <Box
                  title={
                    <FormattedMessage
                      id="app.editExercise.editConfig"
                      defaultMessage="Edit exercise configuration"
                    />
                  }
                  unlimitedHeight
                >
                  <ResourceRenderer resource={[exerciseConfig, exerciseTests]}>
                    {(config, tests) => {
                      const sortedTests = tests.sort((a, b) =>
                        a.name.localeCompare(b.name, locale)
                      );
                      return (
                        <EditExerciseSimpleConfigForm
                          initialValues={getSimpleConfigInitValues(
                            config,
                            sortedTests,
                            locale
                          )}
                          exercise={exercise}
                          exerciseTests={sortedTests}
                          onSubmit={data => console.log(data)}
                        />
                      );
                    }}
                  </ResourceRenderer>
                </Box>
              </Col>
            </Row>
            <br />

            <Row>
              <Col lg={12}>
                <ResourceRenderer resource={exerciseConfig}>
                  {config =>
                    <div>
                      <EditSimpleLimitsBox
                        editLimits={editEnvironmentSimpleLimits}
                        environments={exercise.runtimeEnvironments}
                        limits={limits}
                        config={config}
                        setVertically={setVertically}
                        setHorizontally={setHorizontally}
                        setAll={setAll}
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
  editEnvironmentSimpleLimits: PropTypes.func.isRequired,
  exerciseScoreConfig: PropTypes.object,
  exerciseTests: PropTypes.object,
  editScoreConfig: PropTypes.func.isRequired,
  editTests: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  limits: PropTypes.func.isRequired,
  setHorizontally: PropTypes.func.isRequired,
  setVertically: PropTypes.func.isRequired,
  setAll: PropTypes.func.isRequired,
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
          limits: runtimeEnvironmentId =>
            simpleLimitsSelector(exerciseId, runtimeEnvironmentId)(state),
          exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(
            exerciseId
          )(state),
          exerciseScoreConfig: exerciseScoreConfigSelector(exerciseId)(state),
          exerciseTests: exerciseTestsSelector(exerciseId)(state)
        };
      },
      (dispatch, { params: { exerciseId } }) => ({
        loadAsync: () =>
          EditExerciseSimpleConfig.loadAsync({ exerciseId }, dispatch),
        editEnvironmentSimpleLimits: runtimeEnvironmentId => data =>
          dispatch(
            editEnvironmentSimpleLimits(exerciseId, runtimeEnvironmentId, data)
          ),
        editEnvironmentConfigs: data =>
          dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
        editScoreConfig: data => dispatch(setScoreConfig(exerciseId, data)),
        editTests: data => dispatch(setExerciseTests(exerciseId, data)),
        setHorizontally: (formName, runtimeEnvironmentId) => testName => () =>
          dispatch(
            setHorizontally(
              formName,
              exerciseId,
              runtimeEnvironmentId,
              testName
            )
          ),
        setVertically: (formName, runtimeEnvironmentId) => testName => () =>
          dispatch(
            setVertically(formName, exerciseId, runtimeEnvironmentId, testName)
          ),
        setAll: (formName, runtimeEnvironmentId) => testName => () =>
          dispatch(setAll(formName, exerciseId, runtimeEnvironmentId, testName))
      })
    )(EditExerciseSimpleConfig)
  )
);
