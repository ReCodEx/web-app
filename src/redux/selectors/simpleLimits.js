import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { getExerciseRuntimeEnvironments } from './exercises';
import { endpointDisguisedAsIdFactory } from '../modules/simpleLimits';

const getLimits = state => state.simpleLimits;
const EMPTY_OBJ = {};
const EMPTY_MAP = Map();

/*
export const simpleLimitsSelector = (exerciseId, runtimeEnvironmentId) =>
  createSelector(getLimits, limits =>
    limits.getIn([
      'resources',
      endpointDisguisedAsIdFactory({
        exerciseId,
        runtimeEnvironmentId
      })
    ])
  );
*/

export const simpleLimitsSelector = createSelector(getLimits, limits =>
  limits.get('resources')
);

export const simpleLimitsAllSelector = exerciseId =>
  createSelector(
    [getLimits, getExerciseRuntimeEnvironments(exerciseId)],
    (limits, runtimeEnvironments) => {
      if (!limits || !runtimeEnvironments) {
        return EMPTY_OBJ;
      }

      return runtimeEnvironments.reduce((acc, runtimeEnvironment) => {
        const runtimeEnvironmentId = runtimeEnvironment.get('id');
        let testLimits = limits.getIn([
          'resources',
          endpointDisguisedAsIdFactory({
            exerciseId,
            runtimeEnvironmentId
          }),
          'data'
        ]);
        if (testLimits) {
          testLimits = testLimits.toJS();
        }
        acc[runtimeEnvironmentId] = testLimits;
        return acc;
      }, {});
    }
  );
