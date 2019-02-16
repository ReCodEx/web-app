import { defaultMemoize } from 'reselect';
import { safeGet, arrayToObject, createIndex } from '../../helpers/common';

/**
 * List of environment IDs allowed in simple form.
 * @todo If we find a better way how to do this ...
 */
const SIMPLE_FORM_ENVIRONMENTS = [
  'c-gcc-linux',
  'cxx-gcc-linux',
  'data-linux',
  'freepascal-linux',
  'java',
  'mono',
  'node-linux',
  'php-linux',
  'python3',
];

const SIMPLE_FORM_ENVIRONMENTS_INDEX = createIndex(SIMPLE_FORM_ENVIRONMENTS);

export const onlySimpleEnvironments = defaultMemoize(environments =>
  environments.filter(env => SIMPLE_FORM_ENVIRONMENTS_INDEX[env.id] !== undefined)
);

/**
 * Prepare inital values for the EditEnvironmentSimpleForm of the exercise.
 * @param {*} environmentConfigs
 */
export const getSimpleEnvironmentsInitValues = environmentConfigs => {
  let res = {};
  // all environments
  SIMPLE_FORM_ENVIRONMENTS.forEach(envId => {
    res[envId] = false; // make sure we have all the environments set
  });

  // only environments in the config
  for (const env of environmentConfigs) {
    if (res[env.runtimeEnvironmentId] === false) {
      res[env.runtimeEnvironmentId] = true;
    }
  }
  return res;
};

export const getFirstEnvironmentId = environmentConfigs =>
  safeGet(environmentConfigs, [0, 'runtimeEnvironmentId'], null);

/**
 * Prepare inital values for EditEnvironmentForm used in advanced configuration.
 * Note that advanced config allows only one environment. If multiple environments are defined, only the first is loaded.
 * @param {*} environmentConfigs
 */
export const getEnvironmentInitValues = environmentConfigs => {
  const environmentId = getFirstEnvironmentId(environmentConfigs);
  const variables = safeGet(environmentConfigs, [0, 'variablesTable'], []);
  return { environmentId, variables };
};

/**
 * Transform the data of the EditEnvironmentSimpleForm to the format of the API.
 * @param {*} environmentConfigs
 * @param {*} runtimeEnvironments
 */
export const transformSimpleEnvironmentsValues = (formData, environmentConfigs, runtimeEnvironments) => {
  let res = [];
  SIMPLE_FORM_ENVIRONMENTS.forEach(env => {
    if (formData[env] !== true && formData[env] !== 'true') {
      return;
    }
    const envObj = {
      runtimeEnvironmentId: env,
    };
    const environmentConfig = environmentConfigs.find(e => e.runtimeEnvironmentId === env);
    const runtimeEnvironment = runtimeEnvironments.find(e => e.id === env);
    envObj.variablesTable = environmentConfig
      ? environmentConfig.variablesTable // keep already set variables if they exist
      : runtimeEnvironment.defaultVariables; // use defaults otherwise
    res.push(envObj);
  });
  return res;
};

/**
 * Transform the data of the EditEnvironmentForm to the format of the API.
 * @param {*} environmentConfigs
 * @param {*} runtimeEnvironments
 */
export const transformEnvironmentValues = formData => {
  let res = [];
  if (formData.environmentId) {
    res.push({
      runtimeEnvironmentId: formData.environmentId,
      variablesTable: formData.variables,
    });
  }
  return res;
};

/**
 * Compare two arrays of environment variables to determine whether they hold the same values.
 * @param {array} vars1
 * @param {array} vars1
 */
export const compareVariablesForEquality = (vars1, vars2) => {
  if (vars1.length !== vars2.length) {
    return false;
  }

  const indexed = arrayToObject(vars1, ({ name }) => name);
  return vars2.reduce((res, v) => {
    const type = safeGet(indexed, [v.name, 'type']);
    const value = safeGet(indexed, [v.name, 'value']);
    // types are compared safely only when both present
    return res && value === v.value && (!type || !v.type || type === v.type);
  }, true);
};

/**
 * Get possible variables of file[] type, which can be used in advanced environmentConfig.
 * The variables are returned in an object, names are the keys values are numbers of pipelines in which a variable of that name is present.
 * @param {object} pipelines All pipelines descriptors.
 * @param {array} selectedPipelinesIds Selected pipelines IDs.
 * @returns {object} Variable names and how many times they are present in the pipeline sequence.
 */
export const getPossibleVariablesNames = defaultMemoize((pipelines, selectedPipelinesIds) => {
  if (!pipelines || !selectedPipelinesIds || selectedPipelinesIds.length === 0) {
    return null;
  }

  const res = {};
  selectedPipelinesIds &&
    selectedPipelinesIds.forEach(pid => {
      const pipelineVariables = safeGet(pipelines, [({ id }) => id === pid, 'pipeline', 'variables']);
      pipelineVariables &&
        pipelineVariables
          .filter(({ type }) => type === 'file' || type === 'file[]')
          .forEach(({ name }) => (res[name] = res[name] ? res[name] + 1 : 1));
    });
  return res;
});
