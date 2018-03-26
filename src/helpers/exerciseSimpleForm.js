import yaml from 'js-yaml';
import { defaultMemoize } from 'reselect';

import { safeGet, encodeNumId } from '../helpers/common';

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
    res.push({
      id: test.id,
      name: test.name,
      weight: String(testWeight)
    });
  }

  return {
    isUniform: allWeightsSame,
    tests: res
  };
};

export const transformTestsValues = formData => {
  const uniformScore =
    formData.isUniform === true || formData.isUniform === 'true';
  let scoreConfigData = {
    testWeights: {}
  };
  let tests = [];

  for (const test of formData.tests) {
    const testWeight = uniformScore ? 100 : Number(test.weight);
    scoreConfigData.testWeights[test.name] = testWeight;

    tests.push(
      test.id
        ? {
            id: test.id,
            name: test.name
          }
        : {
            name: test.name
          }
    );
  }

  return {
    tests,
    scoreConfig: yaml.safeDump(scoreConfigData)
  };
};

/*
 * Environments
 */
export const getEnvInitValues = (environmentConfigs, environments) => {
  let res = {};
  // all environments
  for (const env of environments) {
    res[env.id] = false; // make sure we have all the environments set
  }
  // only environments in the config
  for (const env of environmentConfigs) {
    res[env.runtimeEnvironmentId] = true;
  }
  return res;
};

export const transformEnvValues = (
  formData,
  environmentConfigs,
  runtimeEnvironments
) => {
  let res = [];
  for (const env in formData) {
    if (formData[env] !== true && formData[env] !== 'true') {
      continue;
    }
    let envObj = {
      runtimeEnvironmentId: env
    };
    const environmentConfig = environmentConfigs.find(
      e => e.runtimeEnvironmentId === env
    );
    const runtimeEnvironment = runtimeEnvironments.find(e => e.id === env);
    envObj.variablesTable = environmentConfig
      ? environmentConfig.variablesTable // keep already set variables if they exist
      : runtimeEnvironment.defaultVariables; // use defaults otherwise
    res.push(envObj);
  }
  return res;
};

/*
 * Configuration variables
 */

// Execution pipeline variables and their meta-data
// (associated property in form data object, type, and default value).
const EXEC_PIPELINE_VARS = {
  'expected-output': {
    prop: 'expectedOutput',
    type: 'remote-file',
    default: ''
  },
  'run-args': {
    prop: 'runArgs',
    type: 'string[]',
    default: []
  },
  'actual-output': {
    prop: 'outputFile',
    type: 'file'
  },
  'stdin-file': {
    prop: 'inputStdin',
    type: 'remote-file',
    default: ''
  },
  'judge-type': {
    prop: 'judgeBinary',
    type: 'string',
    default: 'recodex-judge-normal'
  },
  'custom-judge': {
    prop: 'customJudgeBinary',
    type: 'remote-file',
    default: ''
  },
  'judge-args': {
    prop: 'judgeArgs',
    type: 'string[]',
    default: []
  },
  'input-files': {
    prop: 'inputFiles',
    type: 'remote-file[]',
    default: []
  },
  'actual-inputs': {
    prop: 'actualInputs',
    type: 'file[]',
    default: []
  }
};

// Structure used to fill empty compilation pipeline variables.
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

const ENTRY_POINT_DEFAULT_VALUE = '$entry-point';

// Fetch one simple variable (string or array) and fill it into the testObj under selected property.
const getSimpleConfigSimpleVariable = (variables, testObj, variableName) => {
  if (EXEC_PIPELINE_VARS[variableName] === undefined) {
    return;
  }

  const propertyName = EXEC_PIPELINE_VARS[variableName].prop;
  const variable = variables.find(variable => variable.name === variableName);
  const isArray = variable && variable.type && variable.type.endsWith('[]');

  let value;
  if (variable) {
    value = variable.value;
    if (isArray && !value) {
      value = [];
    } else if (!isArray) {
      value = value.trim();
    }
  } else if (EXEC_PIPELINE_VARS[variableName].default !== undefined) {
    value = EXEC_PIPELINE_VARS[variableName].default;
  }

  if (value !== undefined) {
    testObj[propertyName] = isArray && !Array.isArray(value) ? [value] : value;
  }
};

const postprocInputFiles = (files, names) =>
  files.map((value, i) => ({
    file: value,
    name: names && names[i] ? names[i].trim() : ''
  }));

const getSimpleConfigCompilationVars = (testObj, config, environments) => {
  const compilation = {};
  for (const environment of environments) {
    const pipelines =
      safeGet(config, [
        c => c.name === environment.runtimeEnvironmentId,
        'tests',
        t => t.name === testObj.name,
        'pipelines'
      ]) || [];

    const data = {
      'extra-files': [],
      'extra-file-names': [],
      'entry-point': ENTRY_POINT_DEFAULT_VALUE
    };
    pipelines.forEach(
      pipeline =>
        pipeline.variables &&
        pipeline.variables.forEach(variable => {
          if (data[variable.name] !== undefined) {
            data[variable.name] = variable.value;
          }
        })
    );

    const entryPoint =
      data['entry-point'] !== ENTRY_POINT_DEFAULT_VALUE
        ? data['entry-point']
        : '';

    compilation[environment.runtimeEnvironmentId] = {
      'extra-files': postprocInputFiles(
        data['extra-files'],
        data['extra-file-names']
      ),
      entryPoint
    };
  }
  testObj.compilation = compilation;
};

// Prepare the initial form data for configuration form ...
export const getSimpleConfigInitValues = defaultMemoize(
  (config, tests, environments) => {
    const confTests =
      tests && config[0] && config[0].tests ? config[0].tests : [];

    let res = {};
    for (let test of tests) {
      const testConf = confTests.find(t => t.name === test.id);
      let testObj = {
        name: test.id
      };

      const variables =
        testConf && testConf.pipelines
          ? testConf.pipelines.reduce(
              (acc, pipeline) => acc.concat(pipeline.variables),
              []
            )
          : [];

      for (const varName in EXEC_PIPELINE_VARS) {
        getSimpleConfigSimpleVariable(variables, testObj, varName);
      }

      // Postprocess input files and their names ...
      testObj.inputFiles = postprocInputFiles(
        testObj.inputFiles,
        testObj.actualInputs
      );
      delete testObj.actualInputs;

      // Additional updates after simple variables were set
      testObj.useOutFile = Boolean(testObj.outputFile);
      testObj.useCustomJudge = Boolean(testObj.customJudgeBinary);
      if (testObj.useCustomJudge) {
        testObj.judgeBinary = '';
      }

      getSimpleConfigCompilationVars(testObj, config, environments);

      res[encodeNumId(test.id)] = testObj;
    }

    return {
      config: res
    };
  }
);

// Prepare one variable to be sent in to the API
const transformConfigSimpleVariable = (variables, name, value) => {
  const finalValue =
    value === undefined ? EXEC_PIPELINE_VARS[name].default : value;
  if (finalValue !== undefined) {
    variables.push({
      name,
      type: EXEC_PIPELINE_VARS[name].type,
      value: finalValue
    });
  }
};

const transformConfigInputFiles = files => {
  let inputFiles = [];
  let actualInputs = [];
  const inFilesArr = files && Array.isArray(files) ? files : [];

  for (const item of inFilesArr) {
    inputFiles.push(item.file);
    actualInputs.push(item.name.trim());
  }

  return {
    inputFiles,
    actualInputs
  };
};

// Prepare variables for execution pipeline of one test in one environment
const transformConfigTestExecutionVariables = (test, envId, hasEntryPoint) => {
  // Final updates ...
  let overrides = transformConfigInputFiles(test.inputFiles);
  overrides[test.useCustomJudge ? 'judgeBinary' : 'customJudgeBinary'] = '';
  if (test.useCustomJudge) {
    overrides.judgeArgs = [];
  }
  overrides.outputFile = test.outputFile && test.outputFile.trim();

  // Prepare variables for the config
  let variables = [];
  for (const varName in EXEC_PIPELINE_VARS) {
    const propName = EXEC_PIPELINE_VARS[varName].prop;
    if (propName !== 'outputFile' || test.useOutFile) {
      transformConfigSimpleVariable(
        variables,
        varName,
        overrides[propName] !== undefined ? overrides[propName] : test[propName]
      );
    }
  }

  // Entry point is a special variable which needs special (per environment) handling.
  if (hasEntryPoint) {
    let entryPoint = safeGet(
      test,
      ['compilation', envId, 'entryPoint'],
      ''
    ).trim();

    const extraFiles = safeGet(test, ['compilation', envId, 'extra-files'], []);
    if (
      entryPoint &&
      !extraFiles.find(({ name }) => entryPoint === name.trim())
    ) {
      entryPoint = '';
    }

    variables.push({
      name: 'entry-point',
      type: 'file',
      value: entryPoint || ENTRY_POINT_DEFAULT_VALUE
    });
  }

  return variables;
};

const mergeOriginalVariables = (newVars, origVars) => {
  const blacklist = new Set(newVars.map(v => v.name));
  origVars.forEach(ov => {
    // Only values unknown to simple form are added
    if (EXEC_PIPELINE_VARS[ov.name] === undefined && !blacklist.has(ov.name)) {
      newVars.push(ov); // add missing variable
    }
  });
};

const mergeCompilationVariables = (origVars, testObj, envId) => {
  const extraFiles = safeGet(testObj, ['compilation', envId, 'extra-files']);
  if (!extraFiles) {
    return origVars;
  }

  const transformed = transformConfigInputFiles(extraFiles);
  const vars = JSON.parse(JSON.stringify(EMPTY_COMPILATION_PIPELINE_VARS));
  vars.find(v => v.name === 'extra-files').value = transformed.inputFiles;
  vars.find(v => v.name === 'extra-file-names').value =
    transformed.actualInputs;

  return origVars
    .filter(v => v.name !== 'extra-files' && v.name !== 'extra-file-names')
    .concat(vars);
};

export const transformConfigValues = (
  formData,
  pipelines,
  environments,
  tests,
  originalConfig
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
      const test = formData.config[encodeNumId(testName)];
      const executionPipeline = test.useOutFile
        ? executionPipelineFiles
        : executionPipelineStdout;

      const originalPipelines = safeGet(originalConfig, [
        config => config.name === envId,
        'tests',
        t => t.name === testName,
        'pipelines'
      ]);

      // Prepare variables for compilation pipeline ...
      const origCompilationVars =
        safeGet(originalPipelines, [
          p => p.name === compilationPipeline.id,
          'variables'
        ]) || EMPTY_COMPILATION_PIPELINE_VARS; // if pipeline variables are not present, prepare an empty set

      const compilationVars = mergeCompilationVariables(
        origCompilationVars,
        test,
        envId
      );

      // Prepare variables for execution pipeline ...
      const execVars = transformConfigTestExecutionVariables(
        test,
        envId,
        executionPipeline.parameters.hasEntryPoint
      );
      const origExecutionVars = safeGet(originalPipelines, [
        p => p.name === executionPipeline.id,
        'variables'
      ]);
      if (origExecutionVars) {
        mergeOriginalVariables(execVars, origExecutionVars);
      }

      testsCfg.push({
        name: testName,
        pipelines: [
          {
            name: compilationPipeline.id,
            variables: compilationVars
          },
          {
            name: executionPipeline.id,
            variables: execVars
          }
        ]
      });
    }
    envs.push({
      name: envId,
      tests: testsCfg
    });
  }

  return { config: envs };
};
