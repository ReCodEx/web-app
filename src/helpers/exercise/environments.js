import { safeGet, arrayToObject } from '../../helpers/common';

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
  'python3'
];

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

/**
 * Prepare inital values for EditEnvironmentForm used in advanced configuration.
 * Note that advanced config allows only one environment. If multiple environments are defined, only the first is loaded.
 * @param {*} environmentConfigs
 */
export const getEnvironmentInitValues = environmentConfigs => {
  const environmentId = safeGet(
    environmentConfigs,
    [0, 'runtimeEnvironmentId'],
    null
  );
  const variables = safeGet(
    environmentConfigs,
    [0, 'variablesTable'],
    []
  ).map(({ name, value }) => ({ name, value }));
  return { environmentId, variables };
};

/**
 * Transform the data of the EditEnvironmentSimpleForm to the format of the API.
 * @param {*} environmentConfigs
 * @param {*} runtimeEnvironments
 */
export const transformSimpleEnvironmentsValues = (
  formData,
  environmentConfigs,
  runtimeEnvironments
) => {
  let res = [];
  for (const env in SIMPLE_FORM_ENVIRONMENTS) {
    if (formData[env] !== true && formData[env] !== 'true') {
      continue;
    }
    const envObj = {
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
      variablesTable: formData.variables.map(({ name, value }) => ({
        name,
        type: 'file[]',
        value
      }))
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
