import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'simpleLimits';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => id
});

export const additionalActionTypes = {
  CLONE_VERTICAL: 'recodex/simpleLimits/CLONE_VERTICAL',
  CLONE_HORIZONTAL: 'recodex/simpleLimits/CLONE_HORIZONTAL',
  CLONE_ALL: 'recodex/simpleLimits/CLONE_ALL'
};

export const endpointDisguisedAsIdFactory = ({
  exerciseId,
  runtimeEnvironmentId
}) => `/exercises/${exerciseId}/environment/${runtimeEnvironmentId}/limits`;

export const fetchExerciseEnvironmentSimpleLimits = (
  exerciseId,
  runtimeEnvironmentId
) =>
  actions.fetchResource(
    endpointDisguisedAsIdFactory({ exerciseId, runtimeEnvironmentId })
  );

export const fetchExerciseEnvironmentSimpleLimitsIfNeeded = (
  exerciseId,
  runtimeEnvironmentId
) =>
  actions.fetchOneIfNeeded(
    endpointDisguisedAsIdFactory({ exerciseId, runtimeEnvironmentId })
  );

export const editEnvironmentSimpleLimits = (
  exerciseId,
  runtimeEnvironmentId,
  data
) =>
  actions.updateResource(
    endpointDisguisedAsIdFactory({ exerciseId, runtimeEnvironmentId }),
    data
  );

export const setVertically = (exerciseId, runtimeEnvironmentId, testName) => ({
  type: additionalActionTypes.CLONE_VERTICAL,
  payload: {
    exerciseId,
    runtimeEnvironmentId,
    testName
  }
});

export const setHorizontally = (
  exerciseId,
  runtimeEnvironmentId,
  testName
) => ({
  type: additionalActionTypes.CLONE_HORIZONTAL,
  payload: {
    exerciseId,
    runtimeEnvironmentId,
    testName
  }
});

export const setAll = (exerciseId, runtimeEnvironmentId, testName) => ({
  type: additionalActionTypes.CLONE_ALL,
  payload: {
    exerciseId,
    runtimeEnvironmentId,
    testName
  }
});

const reducer = handleActions(reduceActions, initialState);
export default reducer;
