import { defaultMemoize } from 'reselect';
import {
  safeGet,
  encodeNumId,
  unique,
  identity,
  EMPTY_ARRAY
} from '../../helpers/common';

/**
 * Base class for all pipeline variables being edited in the config form.
 */
class Variable {
  constructor(
    name,
    type,
    allEnvs = true,
    defaultValue = undefined,
    compilationPipeline = false
  ) {
    this.name = name; // variable name
    this.formProp = name; // redux-form property name
    this.type = type; // variable type (in pipeline)
    this.isArray = type.endsWith('[]');
    this.allEnvs = allEnvs; // whether the variable is the same in all environments
    this.defaultValue =
      defaultValue !== undefined
        ? defaultValue
        : this.isArray ? EMPTY_ARRAY : '';
    this.pipelineFilter = [
      compilationPipeline ? 'isCompilationPipeline' : 'isExecutionPipeline'
    ]; // list of pipeline properties that must be true (idetify pipeline, where the var belongs to)
    this.transformPostprocess = identity;
  }

  /**
   * Change the name of the redux-form property corresponding to this variable.
   * By default, all variables are stored in redux-form under the same name they have in configs.
   */
  overrideFormProp(formProp) {
    this.formProp = formProp;
    return this;
  }

  /**
   * Set a function that post-process transformed variable value.
   */
  setTransformPostprocess(fnc) {
    this.transformPostprocess = fnc;
    return this;
  }

  /**
   * Add pipeline filter (property, that must be set in the pipeline).
   * Only pipelines matching these properties are searched for the variable
   */
  setPipelineFilter(properties) {
    properties = Array.isArray(properties) ? properties : [properties];
    this.pipelineFilter = unique([...this.pipelineFilter, ...properties]);
    return this;
  }

  /**
   * Should the variable be searched in/set in a particular pipeline?
   */
  isApplicableForPipeline(pipeline) {
    return this.pipelineFilter.reduce(
      (res, param) => res && pipeline.parameters[param],
      true
    );
  }

  // Internal reusable function that fetches value of a variable (by given parameters) from a list of pipelines.
  static _getValueFromPipelines(pipelines, name, type, isArray, defaultValue) {
    const variable = pipelines.reduce(
      (acc, pipeline) =>
        acc || pipeline.variables.find(variable => variable.name === name),
      null
    );

    let value;
    if (variable) {
      if (variable.type !== type) {
        throw new Error(
          `Variable '${name}' is of type '${variable.type}', but type '${type}' expected.`
        );
      }
      value = variable.value;
      if (isArray && !value) {
        value = [];
      } else if (!isArray) {
        value = value.trim();
      }
    } else if (defaultValue !== null) {
      value = defaultValue;
    }

    return value !== undefined
      ? isArray && !Array.isArray(value) ? [value] : value
      : null;
  }

  // Fetches value of the variable using this descriptor from a list of pipelines.
  getValueFromPipelines(pipelines) {
    return Variable._getValueFromPipelines(
      pipelines,
      this.name,
      this.type,
      this.isArray,
      this.defaultValue
    );
  }

  /**
   * Retrieve initial values for redux-form from given exercise config.
   * @param {object} config The entire exercise configuration.
   * @param {string} testId ID of a test for which the value is being retrieved.
   * @param {array} environmentsIds List of all enabled environmanets' IDs.
   */
  getInitial(config, testId, environmentsIds) {
    if (this.allEnvs) {
      // All environments are set as one (configuration is taken from the first)
      const pipelines = safeGet(
        config,
        [0, 'tests', t => t.name === testId, 'pipelines'],
        EMPTY_ARRAY
      );

      const value = this.getValueFromPipelines(pipelines);
      return value !== null ? { [this.formProp]: value } : null;
    } else {
      // Load values for each environment separately ...
      const value = {};
      environmentsIds.forEach(envId => {
        const pipelines = safeGet(
          config,
          [c => c.name === envId, 'tests', t => t.name === testId, 'pipelines'],
          EMPTY_ARRAY
        );
        value[envId] = this.getValueFromPipelines(pipelines);
      });
      return { [this.formProp]: value };
    }
  }

  /**
   * Transform a form data into pipeline variables.
   * Returns an array of variables to be set.
   */
  transform(formDataTest, environmentId) {
    let value = this.allEnvs
      ? formDataTest[this.formProp]
      : formDataTest[this.formProp][environmentId];
    value = value === undefined ? this.defaultValue : value;
    value = this.isArray ? value : value.trim();
    value = this.transformPostprocess(value, formDataTest, environmentId);
    return value !== undefined
      ? [
          // simple variables set only one value
          {
            name: this.name,
            type: this.type,
            value
          }
        ]
      : [];
  }
}

/**
 * Special variable that in fact processes two entagled variables
 * -- file list and internal names for the files on the list.
 * These two variables must be represented by a signle (array) variable in redux-form.
 */
class FileListVariable extends Variable {
  constructor(name, nameActuals, allEnvs = true, compilationPipeline = false) {
    super(name, 'remote-file[]', allEnvs, [], compilationPipeline);
    this.nameActuals = nameActuals;
  }

  getValueFromPipelines(pipelines) {
    const files = super.getValueFromPipelines(pipelines);
    const names = Variable._getValueFromPipelines(
      pipelines,
      this.nameActuals,
      'file[]',
      true,
      this.defaultValue
    );

    return files.map((value, i) => ({
      file: value,
      name: names && names[i] ? names[i].trim() : ''
    }));
  }

  transform(formDataTest, environmentId) {
    // Find the value in question ...
    let value = this.allEnvs
      ? formDataTest[this.formProp]
      : formDataTest[this.formProp][environmentId];
    value = value === undefined ? this.defaultValue : value;

    // Split it into files and their actual names ...
    let inputFiles = [];
    let actualInputs = [];
    for (const item of value) {
      inputFiles.push(item.file);
      actualInputs.push(item.name.trim());
    }

    return [
      {
        name: this.name,
        type: this.type,
        value: inputFiles
      },
      {
        name: this.nameActuals,
        type: 'file[]',
        value: actualInputs
      }
    ];
  }
}

/*
 * List of known variables and their meta-configuration
 */
const PIPELINE_VARS_DESCRIPTORS = [
  new Variable('expected-output', 'remote-file'),
  new Variable('run-args', 'string[]'),
  new Variable('actual-output', 'file').setPipelineFilter('producesFiles'),
  new Variable('stdin-file', 'remote-file'),
  new Variable(
    'judge-type',
    'string',
    true,
    'recodex-judge-normal'
  ).setTransformPostprocess(
    (value, formDataTest) => (formDataTest.useCustomJudge ? '' : value)
  ),
  new Variable('custom-judge', 'remote-file').setTransformPostprocess(
    (value, formDataTest) => (formDataTest.useCustomJudge ? value : '')
  ),
  new Variable('judge-args', 'string[]').setTransformPostprocess(
    (value, formDataTest) => (formDataTest.useCustomJudge ? value : [])
  ),
  new FileListVariable('input-files', 'actual-inputs'),
  new FileListVariable('extra-files', 'extra-file-names', false, true),
  new Variable(
    'entry-point',
    'file',
    false,
    '$entry-point',
    true
  ).setPipelineFilter('hasEntryPoint')
];

/**
 * Prepare the initial form data for configuration form ...
 */
export const getSimpleConfigInitValues = defaultMemoize(
  (config, tests, exerciseEnvironmentsConfig) => {
    const environmentsIds = exerciseEnvironmentsConfig.map(
      env => env.runtimeEnvironmentId
    );

    let res = {};
    for (let test of tests) {
      let testObj = { name: test.id };

      // Load pipelines into test container ...
      PIPELINE_VARS_DESCRIPTORS.forEach(variable => {
        const vals = variable.getInitial(config, test.id, environmentsIds);
        if (vals) {
          testObj = { ...testObj, ...vals };
        }
      });

      // Additional updates after simple variables were set
      testObj.useOutFile = Boolean(testObj['actual-output']);
      testObj.useCustomJudge = Boolean(testObj['custom-judge']);
      if (testObj.useCustomJudge) {
        testObj['judge-type'] = '';
      }

      res[encodeNumId(test.id)] = testObj;
    }

    return {
      config: res
    };
  }
);

// Merge new variables with original variables from the pipeline.
const mergeVariables = (newVars, origVars) => {
  const vars = new Map();
  origVars.forEach(v => vars.set(v.name, v));
  newVars.forEach(v => vars.set(v.name, v)); // override origs
  return Array.from(vars.values());
};

/**
 * Assemble the data to be sent to the endpoint from the form data ...
 */
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

    // Create configuration for all tests ...
    let testsCfg = [];
    for (const t of tests) {
      const testName = t.id;
      const test = formData.config[encodeNumId(testName)];

      const pipelinesConfig = pipelines
        .filter(
          // get all relevant pipelines ...
          pipeline =>
            pipeline.runtimeEnvironmentIds.includes(envId) &&
            (!pipeline.parameters.isExecutionPipeline ||
              (test.useOutFile
                ? pipeline.parameters.producesFiles
                : pipeline.parameters.producesStdout))
        )
        .sort(
          // make sure compilation pipeline is first
          (a, b) =>
            a.parameters.isCompilationPipeline
              ? -1
              : b.parameters.isCompilationPipeline ? 1 : 0
        )
        .map(pipeline => {
          // Load original variables from the pipeline conifg ...
          const originalVariables =
            safeGet(originalConfig, [
              config => config.name === envId,
              'tests',
              t => t.name === testName,
              'pipelines',
              p => p.name === pipeline.id,
              'variables'
            ]) || [];

          // Construct new variables from the form data ...
          const variables = [];
          PIPELINE_VARS_DESCRIPTORS.filter(v =>
            v.isApplicableForPipeline(pipeline)
          ).forEach(v => variables.push(...v.transform(test, envId)));

          return {
            name: pipeline.id,
            variables: mergeVariables(variables, originalVariables)
          };
        });

      testsCfg.push({
        name: testName,
        pipelines: pipelinesConfig
      });
    }
    envs.push({
      name: envId,
      tests: testsCfg
    });
  }

  return { config: envs };
};
