import yaml from 'js-yaml';

export const getEnvInitValues = environmentConfigs => {
  let res = {};
  for (const env of environmentConfigs) {
    res[env.runtimeEnvironmentId] = true;
  }
  return res;
};

export const transformAndSendEnvValues = (
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

export const getTestsInitValues = (exerciseTests, scoreConfig, locale) => {
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

export const transformAndSendTestsValues = (
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

export const getSimpleConfigInitValues = (config, tests, locale) => {
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
    } else {
      testObj.outputFile = '';
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

export const transformAndSendConfigValues = (
  formData,
  pipelines,
  environments,
  setConfig
) => {
  let testVars = [];
  for (const test of formData.config) {
    let variables = [];
    let producesFiles = false;

    variables.push({
      name: 'custom-judge',
      type: 'remote-file',
      value: test.customJudgeBinary
    });
    variables.push({
      name: 'expected-output',
      type: 'remote-file',
      value: test.expectedOutput
    });
    variables.push({
      name: 'judge-type',
      type: 'string',
      value: test.judgeBinary
    });
    variables.push({
      name: 'stdin-file',
      type: 'remote-file',
      value: test.inputStdin
    });
    variables.push({
      name: 'judge-args',
      type: 'string[]',
      value: test.judgeArgs
    });
    variables.push({
      name: 'run-args',
      type: 'string[]',
      value: test.runArgs
    });
    if (test.outputFile !== '') {
      variables.push({
        name: 'actual-output',
        type: 'file[]',
        value: test.outputFile
      });
      producesFiles = true;
    }

    let inputFiles = [];
    let renamedNames = [];
    for (const item of test.inputFiles) {
      inputFiles.push(item.first);
      renamedNames.push(item.second);
    }
    variables.push({
      name: 'input-files',
      type: 'remote-file[]',
      value: inputFiles
    });
    variables.push({
      name: 'actual-inputs',
      type: 'file[]',
      value: renamedNames
    });

    testVars.push({
      name: test.name,
      variables: variables,
      producesFiles: producesFiles
    });
  }

  let envs = [];
  for (const environment of environments) {
    const envId = environment.runtimeEnvironmentId;
    const envPipelines = pipelines.filter(
      pipeline => pipeline.runtimeEnvironmentId === envId
    );

    let tests = [];
    for (const testVar of testVars) {
      const compilationPipelineId = envPipelines.filter(
        pipeline => pipeline.parameters.isCompilationPipeline
      )[0].id;
      const executionPipelineId = envPipelines.filter(
        pipeline =>
          pipeline.parameters.isExecutionPipeline &&
          (testVar.producesFiles
            ? pipeline.parameters.producesFiles
            : pipeline.parameters.producesStdout)
      )[0].id;
      tests.push({
        name: testVar.name,
        pipelines: [
          {
            name: compilationPipelineId,
            variables: []
          },
          {
            name: executionPipelineId,
            variables: testVar.variables
          }
        ]
      });
    }
    envs.push({
      name: envId,
      tests: tests
    });
  }

  return setConfig({ config: envs });
};
