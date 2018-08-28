import { defaultMemoize } from 'reselect';
import { safeGet, arrayToObject } from '../common';

/**
 * Return ordered list of pipeline IDs used in exercise config.
 * @param {object} config Exercise configuration object.
 */
export const getPipelines = defaultMemoize(config =>
  // There should be only one environment and all tests have the same pipelines (hence we take first and first)
  safeGet(config, [0, 'tests', 0, 'pipelines'], []).map(({ name }) => name)
);

/**
 * Return initial values (list of pipeline IDs) for EditExercisePipelinesForm.
 * @param {object} config Exercise configuration object.
 */
export const getPipelinesInitialValues = defaultMemoize(config => ({
  pipelines: getPipelines(config)
}));

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

  const mustHave = arrayToObject(pipelineVars, ({ name }) => name);
  const res = [];
  oldVars
    .filter(({ name, type }) => mustHave[name] && mustHave[name].type === type)
    .forEach(v => {
      res.push(v);
      delete mustHave[v.name];
    });

  Object.values(mustHave).forEach(v => res.push(v));
  return res;
};

/**
 * Assemble new exercise configuration when runtime or pipelines are changed.
 * It attempts to preserve as much as possible from the old configuration and fill default values for new variables.
 * @param {object} oldConfig Original (current) exercise configuration.
 * @param {string} runtimeId Selected environment runtime ID.
 * @param {array} tests List of tests of the exercise.
 * @param {array} pipelines Sequence of pipeline IDs used in the configuration.
 * @param {object} pipelinesVariables Descriptors of variables which are expected to be set for each pipeline.
 */
export const assembleNewConfig = (
  oldConfig,
  runtimeId,
  tests,
  pipelines,
  pipelinesVariables
) => ({
  config: [
    {
      name: runtimeId,
      tests: tests.map(test => ({
        name: test.id,
        pipelines: pipelines.map(pid => ({
          name: pid,
          variables: mergeConfigVariables(
            safeGet(oldConfig, [
              ({ name }) => name === runtimeId,
              'tests',
              ({ name }) => name === test.id,
              'pipelines',
              ({ name }) => name === pid,
              'variables'
            ]),
            safeGet(pipelinesVariables, [pid])
          )
        }))
      }))
    }
  ]
});

/**
 *
 */
export const getAdvancedConfigInitialValues = () => {};
