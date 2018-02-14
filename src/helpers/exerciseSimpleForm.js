import yaml from 'js-yaml';
import { defaultMemoize } from 'reselect';

import {
  endpointDisguisedAsIdFactory,
  encodeTestId,
  encodeEnvironmentId
} from '../redux/modules/simpleLimits';

// safe getter to traverse compex object/array structures
const _safeGet = (obj, path) => {
  path.forEach(step => {
    obj = obj && (typeof step === 'function' ? obj.find(step) : obj[step]);
  });
  return obj;
};

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
  environments,
  editEnvironmentConfigs
) => {
  let res = [];
  for (const env in formData) {
    if (formData[env] !== true && formData[env] !== 'true') {
      continue;
    }
    let envObj = {
      runtimeEnvironmentId: env
    };
    const currentFullEnv = environments.find(e => e.id === env);
    envObj.variablesTable = currentFullEnv.defaultVariables;
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
      _safeGet(config, [
        c => c.name === environment.runtimeEnvironmentId,
        'tests',
        t => t.name === testObj.name,
        'pipelines'
      ]) || [];

    const data = {
      'extra-files': [],
      'extra-file-names': []
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

    compilation[environment.runtimeEnvironmentId] = {
      'extra-files': postprocInputFiles(
        data['extra-files'],
        data['extra-file-names']
      )
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

      res[encodeTestId(test.id)] = testObj;
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
const transformConfigTestExecutionVariables = test => {
  // Final updates ...
  let overrides = transformConfigInputFiles(test.inputFiles);
  if (!test.useCustomJudge) {
    overrides.customJudgeBinary = '';
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

  return variables;
};

const mergeOriginalVariables = (newVars, origVars) => {
  origVars.forEach(ov => {
    // Only values unknown to simple form are added
    if (EXEC_PIPELINE_VARS[ov.name] === undefined) {
      newVars.push(ov); // add missing variable
    }
  });
};

const mergeCompilationVariables = (origVars, testObj, envId) => {
  const extraFiles = _safeGet(testObj, ['compilation', envId, 'extra-files']);
  if (!extraFiles) {
    return origVars;
  }

  const transformed = transformConfigInputFiles(extraFiles);
  const vars = JSON.parse(JSON.stringify(EMPTY_COMPILATION_PIPELINE_VARS));
  vars.find(v => v.name === 'extra-files').value = transformed.inputFiles;
  vars.find(v => v.name === 'extra-file-names').value =
    transformed.actualInputs;

  return [
    ...origVars.filter(
      v => v.name !== 'extra-files' && v.name !== 'extra-file-names'
    ),
    ...vars
  ];
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
      const test = formData.config[encodeTestId(testName)];
      const executionPipeline = test.useOutFile
        ? executionPipelineFiles
        : executionPipelineStdout;

      const originalPipelines = _safeGet(originalConfig, [
        config => config.name === envId,
        'tests',
        t => t.name === testName,
        'pipelines'
      ]);

      // Prepare variables for compilation pipeline ...
      const origCompilationVars =
        _safeGet(originalPipelines, [
          p => p.name === compilationPipeline.id,
          'variables'
        ]) || EMPTY_COMPILATION_PIPELINE_VARS; // if pipeline variables are not present, prepare an empty set

      const compilationVars = mergeCompilationVariables(
        origCompilationVars,
        test,
        envId
      );

      // Prepare variables for execution pipeline ...
      const testVars = transformConfigTestExecutionVariables(test);
      const origExecutionVars = _safeGet(originalPipelines, [
        p => p.name === executionPipeline.id,
        'variables'
      ]);
      if (origExecutionVars) {
        mergeOriginalVariables(testVars, origExecutionVars);
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
            variables: testVars
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

/*
 * Memory and Time limits
 */
export const getLimitsInitValues = defaultMemoize(
  (limits, tests, environments, exerciseId) => {
    let res = {};
    let wallTimeCount = 0;
    let cpuTimeCount = 0;

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

        // Prepare time object and aggregate data for heuristics ...
        const time = {};
        if (lim && lim['wall-time']) {
          time['wall-time'] = String(lim['wall-time']);
          ++wallTimeCount;
        }
        if (lim && lim['cpu-time']) {
          time['cpu-time'] = String(lim['cpu-time']);
          ++cpuTimeCount;
        }
        res[testEnc][envId] = {
          memory: lim ? String(lim.memory) : '0',
          time
        };
      });
    });

    // Use heuristics to decide, which time will be used, and postprocess the data
    const preciseTime = cpuTimeCount >= wallTimeCount;
    const primaryTime = preciseTime ? 'cpu-time' : 'wall-time';
    const secondaryTime = preciseTime ? 'wall-time' : 'cpu-time';
    for (const testEnc in res) {
      for (const envId in res[testEnc]) {
        const time = res[testEnc][envId].time;
        res[testEnc][envId].time =
          time[primaryTime] !== undefined
            ? time[primaryTime]
            : time[secondaryTime] !== undefined ? time[secondaryTime] : '0';
      }
    }

    return {
      limits: res,
      preciseTime
    };
  }
);

const transformLimitsObject = ({ memory, time }, timeField = 'wall-time') => {
  let res = {
    memory
  };
  res[timeField] = time;
  return res;
};

/**
 * Transform form data and pass them to dispatching function.
 * The data have to be re-assembled, since they use different format and keys are encoded.
 * The dispatching function is invoked for every environment and all promise is returned.
 */
export const transformLimitsValues = (formData, tests, runtimeEnvironments) =>
  runtimeEnvironments.map(environment => {
    const envId = encodeEnvironmentId(environment.id);
    const data = {
      limits: tests.reduce((acc, test) => {
        acc[test.id] = transformLimitsObject(
          formData.limits[encodeTestId(test.id)][envId],
          formData.preciseTime ? 'cpu-time' : 'wall-time'
        );
        return acc;
      }, {})
    };
    return { id: environment.id, data };
  });
