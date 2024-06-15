import { lruMemoize } from 'reselect';
import { safeGet, arrayToObject, encodeNumId, encodeId } from '../common';

/**
 * Return ordered list of pipeline IDs used in exercise config.
 * @param {Object[]} config Exercise configuration object.
 */
export const getPipelines = lruMemoize(config =>
  // There should be only one environment and all tests have the same pipelines (hence we take first and first)
  (safeGet(config, [0, 'tests', 0, 'pipelines']) || []).map(({ name }) => name)
);

/**
 * Return initial values (list of pipeline IDs) for EditExercisePipelinesForm.
 * @param {Object[]} config Exercise configuration object.
 */
export const getPipelinesInitialValues = lruMemoize(config => ({
  pipelines: getPipelines(config),
}));

/**
 * Get list of variables from exercise config (for given runtime, test, and pipeline).
 * @param {Object[]} config
 * @param {string} runtimeId
 * @param {number} testId
 * @param {number} pipelineIdx
 * @param {string} pipelineId
 */
const getConfigVariables = (config, runtimeId, testId, pipelineIdx, pipelineId) => {
  const pipeline = safeGet(config, [
    ({ name }) => name === runtimeId,
    'tests',
    ({ name }) => name === testId,
    'pipelines',
    pipelineIdx,
  ]);
  return pipeline && pipeline.name === pipelineId ? pipeline.variables : null;
};

/**
 * Safe way to get value of specific variable (of given runtime, test, and pipeline) in exercise config.
 * Variable type may be optionally tested. If not present (or type does not match), defaultValue is returned.
 * @param {Object[]} config
 * @param {string} runtimeId
 * @param {number} testId
 * @param {number} pipelineIdx
 * @param {string} pipelineId
 * @param {string} variableName
 * @param {?string} variableType
 * @param {*} defaultValue
 * */
const getConfigVariableValue = (
  config,
  runtimeId,
  testId,
  pipelineIdx,
  pipelineId,
  variableName,
  variableType = null,
  defaultValue = undefined
) => {
  const variables = getConfigVariables(config, runtimeId, testId, pipelineIdx, pipelineId);
  return (
    variables &&
    safeGet(
      variables,
      [({ name, type }) => name === variableName && (!variableType || type === variableType), 'value'],
      defaultValue
    )
  );
};

/**
 * Merge variable list from old config and prescribed defaults from pipelinesVariables.
 */
const mergeConfigVariables = (oldVars, pipelineVars) => {
  if (!oldVars) {
    return pipelineVars;
  }
  if (!pipelineVars) {
    return oldVars;
  }

  const olds = arrayToObject(oldVars, ({ name }) => name);
  const res = [];
  pipelineVars.forEach(v => {
    // Use old value if appropriate variable exists or pipelines variable with default value.
    res.push(olds[v.name] && olds[v.name].type === v.type ? olds[v.name] : v);
  });
  return res;
};

/**
 * Assemble new exercise configuration when runtime or pipelines are changed.
 * It attempts to preserve as much as possible from the old configuration and fill default values for new variables.
 * @param {object} oldConfig Original (current) exercise configuration.
 * @param {string} runtimeId Selected environment runtime ID.
 * @param {array} tests List of tests of the exercise.
 * @param {array} pipelinesVariables Descriptors of variables which are expected to be set for each pipeline.
 */
export const assembleNewConfig = (oldConfig, runtimeId, tests, pipelinesVariables) => ({
  config: [
    {
      name: runtimeId,
      tests: tests.map(({ id: testId }) => ({
        name: testId,
        pipelines: pipelinesVariables.map(({ id: pipelineId, variables }, pipelineIdx) => ({
          name: pipelineId,
          variables: mergeConfigVariables(
            getConfigVariables(oldConfig, runtimeId, testId, pipelineIdx, pipelineId),
            variables
          ),
        })),
      })),
    },
  ],
});

/**
 * Prepare initial values for advanced config form.
 * @param {Object} exerciseConfig,
 * @param {string} runtimeId
 * @param {Object[]} tests
 * @param {Object[]} pipelinesVariables
 */
export const getAdvancedConfigInitValues = (exerciseConfig, runtimeId, tests, pipelinesVariables) => {
  const config = {};

  if (runtimeId && tests && pipelinesVariables) {
    tests.forEach(({ id: testId }) => {
      config[encodeNumId(testId)] = pipelinesVariables.map(({ id: pipelineId, variables }, pipelineIdx) => {
        const res = {};
        variables.forEach(({ name, type, value }) => {
          res[encodeId(name)] = getConfigVariableValue(
            exerciseConfig,
            runtimeId,
            testId,
            pipelineIdx,
            pipelineId,
            name,
            type,
            value
          );
        });
        return res;
      });
    });
  }
  return { config };
};

/**
 * Convert form data of the advanced config form into exercise config API format.
 * @param {Object} formData.config
 * @param {string} runtimeId
 * @param {Object[]} tests
 * @param {Object[]} pipelinesVariables
 */
export const transformAdvancedConfigValues = ({ config }, runtimeId, tests, pipelinesVariables) => ({
  config: [
    {
      name: runtimeId,
      tests: tests.map(({ id: testId }) => ({
        name: testId,
        pipelines: pipelinesVariables.map(({ id: pipelineId, variables }, pipelineIdx) => ({
          name: pipelineId,
          variables: variables.map(({ name, type }) => ({
            name,
            type,
            value: safeGet(config, [encodeNumId(testId), pipelineIdx, encodeId(name)]),
          })),
        })),
      })),
    },
  ],
});
