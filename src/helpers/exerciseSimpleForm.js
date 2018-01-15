import yaml from 'js-yaml';
import {
  endpointDisguisedAsIdFactory,
  encodeTestId,
  encodeEnvironmentId
} from '../redux/modules/simpleLimits';

/*
 * Tests and Score
 */
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
    res.push({ id: test.id, name: test.name, weight: String(testWeight) });
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

    testsData.push(
      test.id ? { id: test.id, name: test.name } : { name: test.name }
    );
  }

  return Promise.all([
    editExerciseTests({ tests: testsData }),
    editExerciseScoreConfig({ scoreConfig: yaml.safeDump(scoreConfigData) })
  ]);
};

/*
 * Environments
 */
export const getEnvInitValues = environmentConfigs => {
  let res = {};
  for (const env of environmentConfigs) {
    res[env.runtimeEnvironmentId] = true;
  }
  return res;
};

export const transformEnvValues = (
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
  return res;
};

/*
 * Configuration variables
 */

// Configure simple variables using mapping between name and testObj property.
// Object has the same properites as testObj and values are variable names.
const simpleConfigVariablesMapping = {
  expectedOutput: 'expected-output',
  runArgs: 'run-args',
  outputFile: 'actual-output',
  inputStdin: 'stdin-file',
  judgeBinary: 'judge-type',
  customJudgeBinary: 'custom-judge',
  judgeArgs: 'judge-args'
};

// Variable types as they should be sent back to API
const simpleConfigVariablesTypes = {
  'expected-output': 'remote-file',
  'run-args': 'string[]',
  'actual-output': 'file',
  'stdin-file': 'remote-file',
  'judge-type': 'string',
  'custom-judge': 'remote-file',
  'judge-args': 'string[]',
  'input-files': 'remote-file[]',
  'actual-inputs': 'file[]'
};

const EMPTY_COMPILATION_PIPELINE_VARS = [
  {
    name: 'extra-files',
    type: 'remote-file[]',
    value: []
  },
  {
    name: 'extra-file-names',
    type: 'file[]',
    value: []
  }
];

// Fetch one simple variable (string or array) and fill it into the testObj under selected property.
const getSimpleConfigSimpleVariable = (
  variables,
  testObj,
  variableName,
  propertyName
) => {
  const variable = variables.find(variable => variable.name === variableName);
  const isArray = variable && variable.type && variable.type.endsWith('[]');
  if (isArray) {
    testObj[propertyName] = []; // array needs default
  }
  if (variable) {
    let value = variable.value;
    if (isArray && !value) {
      value = [];
    } else if (!isArray) {
      value = value.trim();
    }
    testObj[propertyName] = isArray && !Array.isArray(value) ? [value] : value;
  }
};

// Get input files and their corresponding actual names (and fill them to testObj).
const getSimpleConfigInputFiles = (variables, testObj) => {
  const inputFiles = variables.find(
    variable => variable.name === 'input-files'
  );
  const actualInputs = variables.find(
    variable => variable.name === 'actual-inputs'
  );
  if (inputFiles) {
    testObj.inputFiles = inputFiles.value
      ? inputFiles.value.map((value, i) => ({
          file: value,
          name:
            actualInputs && actualInputs.value && actualInputs.value[i]
              ? actualInputs.value[i].trim()
              : ''
        }))
      : [];
  }
};

// Prepare the initial form data for configuration form ...
export const getSimpleConfigInitValues = (config, tests) => {
  const confTests =
    tests && config[0] && config[0].tests ? config[0].tests : [];

  let res = {};
  for (let test of tests) {
    const testConf = confTests.find(t => t.name === test.id);
    let testObj = { name: test.id };

    const variables =
      testConf && testConf.pipelines
        ? testConf.pipelines.reduce(
            (acc, pipeline) => acc.concat(pipeline.variables),
            []
          )
        : [];

    // Fetch values from variables and fill them to testObj.
    getSimpleConfigInputFiles(variables, testObj);

    for (const property in simpleConfigVariablesMapping) {
      getSimpleConfigSimpleVariable(
        variables,
        testObj,
        simpleConfigVariablesMapping[property],
        property
      );
    }

    // Additional updates after simple variables were set
    testObj.useOutFile = Boolean(testObj.outputFile);
    testObj.useCustomJudge = Boolean(testObj.customJudgeBinary);
    if (testObj.useCustomJudge) {
      testObj.judgeBinary = '';
    } else if (!testObj.judgeBinary) {
      testObj.judgeBinary = 'recodex-judge-normal';
    }

    res[encodeTestId(test.id)] = testObj;
  }

  return { config: res };
};

// Prepare one variable to be sent in to the API
const transformConfigSimpleVariable = (variables, name, value) => {
  if (value !== undefined) {
    variables.push({ name, type: simpleConfigVariablesTypes[name], value });
  }
};

const transformConfigInputFiles = (variables, test) => {
  let inputFiles = [];
  let renamed = [];
  const inFilesArr =
    test.inputFiles && Array.isArray(test.inputFiles) ? test.inputFiles : [];

  for (const item of inFilesArr) {
    inputFiles.push(item.file);
    renamed.push(item.name.trim());
  }

  transformConfigSimpleVariable(variables, 'input-files', inputFiles);
  transformConfigSimpleVariable(variables, 'actual-inputs', renamed);
};

// Prepare variables for execution pipeline of one test in one environment
const transformConfigTestExecutionVariables = test => {
  // Final updates ...
  if (!test.useCustomJudge) {
    test.customJudgeBinary = '';
  }
  test.outputFile = test.useOutFile ? test.outputFile.trim() : undefined;

  // Prepare variables for the config
  let variables = [];
  for (const property in simpleConfigVariablesMapping) {
    transformConfigSimpleVariable(
      variables,
      simpleConfigVariablesMapping[property],
      test[property]
    );
  }

  transformConfigInputFiles(variables, test);

  return variables;
};

const mergeOriginalVariables = (newVars, origVars) => {
  origVars.forEach(ov => {
    // Only values unknown to simple form are added
    if (simpleConfigVariablesTypes[ov.name] === undefined) {
      newVars.push(ov); // add missing variable
    }
  });
};

export const transformAndSendConfigValues = (
  formData,
  pipelines,
  environments,
  tests,
  originalConfig,
  setConfig
) => {
  let envs = [];
  for (const environment of environments) {
    const envId = environment.runtimeEnvironmentId;
    const envPipelines = pipelines.filter(
      pipeline => pipeline.runtimeEnvironmentIds.indexOf(envId) >= 0
    );

    // Find the right pipelines ...
    const compilationPipeline = envPipelines.find(
      pipeline => pipeline.parameters.isCompilationPipeline
    );
    const executionPipelineStdout = envPipelines.find(
      pipeline =>
        pipeline.parameters.isExecutionPipeline &&
        pipeline.parameters.producesStdout
    );
    const executionPipelineFiles = envPipelines.find(
      pipeline =>
        pipeline.parameters.isExecutionPipeline &&
        pipeline.parameters.producesFiles
    );

    // Create configuration for all tests ...
    let testsCfg = [];
    for (const t of tests) {
      const testName = t.id;
      const test = formData.config[encodeTestId(testName)];
      const executionPipeline = test.useOutFile
        ? executionPipelineFiles
        : executionPipelineStdout;

      const originalPipelines = originalConfig
        .find(config => config.name === envId) // config for the right environment
        .tests.find(test => test.name === testName).pipelines; // and the right test

      // Get original values of compilation pipeline ...
      const originalCompilationPipeline = originalPipelines.find(
        p => p.name === compilationPipeline.id
      );
      const origCompilationVars =
        (originalCompilationPipeline &&
          originalCompilationPipeline.variables) ||
        EMPTY_COMPILATION_PIPELINE_VARS; // if pipeline variables are not present, prepare an empty set

      // Prepare variables for execution pipeline ...
      const testVars = transformConfigTestExecutionVariables(test);

      const originalExecutionPipeline = originalPipelines.find(
        p => p.name === executionPipeline.id
      );
      if (originalExecutionPipeline && originalExecutionPipeline.variables) {
        const origExecutionVars = originalExecutionPipeline.variables; // the second pipeline is for execution
        mergeOriginalVariables(testVars, origExecutionVars);
      }

      testsCfg.push({
        name: testName,
        pipelines: [
          {
            name: compilationPipeline.id,
            variables: origCompilationVars // copied from original config
          },
          {
            name: executionPipeline.id,
            variables: testVars // TODO merge with original config
          }
        ]
      });
    }
    envs.push({
      name: envId,
      tests: testsCfg
    });
  }

  return setConfig({ config: envs });
};

/*
 * Memory and Time limits
 */
export const getLimitsInitValues = (
  limits,
  tests,
  environments,
  exerciseId
) => {
  let res = {};

  tests.forEach(test => {
    const testEnc = encodeTestId(test.id);
    res[testEnc] = {};
    environments.forEach(environment => {
      const envId = encodeEnvironmentId(environment.id);
      let lim = limits.getIn([
        endpointDisguisedAsIdFactory({
          exerciseId,
          runtimeEnvironmentId: environment.id
        }),
        'data',
        String(test.id)
      ]);
      if (lim) {
        lim = lim.toJS();
      }

      res[testEnc][envId] = {
        memory: lim ? String(lim.memory) : '0',
        'wall-time': lim ? String(lim['wall-time']) : '0'
      };
    });
  });

  return { limits: res };
};

/**
 * Transform form data and pass them to dispatching function.
 * The data have to be re-assembled, since they use different format and keys are encoded.
 * The dispatching function is invoked for every environment and all promise is returned.
 */
export const transformAndSendLimitsValues = (
  formData,
  tests,
  runtimeEnvironments,
  editEnvironmentSimpleLimits
) =>
  Promise.all(
    runtimeEnvironments.map(environment => {
      const envId = encodeEnvironmentId(environment.id);
      const data = {
        limits: tests.reduce((acc, test) => {
          acc[test.id] = formData.limits[encodeTestId(test.id)][envId];
          return acc;
        }, {})
      };
      return editEnvironmentSimpleLimits(environment.id, data);
    })
  );
