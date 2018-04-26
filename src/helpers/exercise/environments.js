/**
 * Prepare inital values for the EditEnvironmentSimpleForm of the exercise.
 * @param {*} environmentConfigs
 * @param {*} runtimeEnvironments
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

/**
 * Transform the data of the form
 * @param {*} environmentConfigs
 * @param {*} runtimeEnvironments
 */
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
