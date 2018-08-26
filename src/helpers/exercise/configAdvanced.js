import { defaultMemoize } from 'reselect';
import { safeGet } from '../common';

/**
 *
 */
export const getPipelinesInitialValues = defaultMemoize(config => ({
  // There should be only one environment and all tests have the same pipelines (hence we take first and first)
  pipelines: safeGet(config, [0, 'tests', 0, 'pipelines'], []).map(
    ({ name }) => name
  )
}));

/**
 *
 */
export const assembleNewConfig = (
  oldConfig,
  runtimeId,
  tests,
  pipelines,
  pipelineVariables
) => ({
  config: [
    {
      name: runtimeId,
      tests: tests.map(test => ({
        name: test.id,
        pipelines: pipelines.map(pid => ({
          name: pid,
          variables: safeGet(
            oldConfig,
            [
              ({ name }) => name === runtimeId,
              'tests',
              ({ name }) => name === test.id,
              'pipelines',
              ({ name }) => name === pid,
              'variables'
            ],
            safeGet(pipelineVariables, [pid])
          )
        }))
      }))
    }
  ]
});
