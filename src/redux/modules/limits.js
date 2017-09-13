import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'exerciseEnvironmentLimits';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => id
});

export const endpointDisguisedAsIdFactory = ({
  exerciseId,
  hwGroup,
  runtimeEnvironmentId
}) =>
  `/exercises/${exerciseId}/environment/${runtimeEnvironmentId}/hwgroup/${hwGroup}/limits`;

export const fetchExerciseEnvironmentLimits = (
  exerciseId,
  runtimeEnvironmentId,
  hwGroup
) =>
  actions.fetchResource(
    endpointDisguisedAsIdFactory({ exerciseId, hwGroup, runtimeEnvironmentId })
  );

export const fetchExerciseEnvironmentLimitsIfNeeded = (
  exerciseId,
  runtimeEnvironmentId,
  hwGroup
) =>
  actions.fetchOneIfNeeded(
    endpointDisguisedAsIdFactory({ exerciseId, hwGroup, runtimeEnvironmentId })
  );

export const editEnvironmentLimits = (
  exerciseId,
  runtimeEnvironmentId,
  hwGroup,
  data
) =>
  actions.updateResource(
    endpointDisguisedAsIdFactory({ exerciseId, hwGroup, runtimeEnvironmentId }),
    data
  );

const reducer = handleActions(reduceActions, initialState);
export default reducer;
