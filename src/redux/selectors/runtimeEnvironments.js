import { createSelector } from 'reselect';

const getRuntimeEnvironments = state => state.runtimeEnvironments;
const getResources = runtimeEnvironments => runtimeEnvironments.get('resources');

export const runtimeEnvironmentsSelector = createSelector(getRuntimeEnvironments, getResources);
export const runtimeEnvironmentSelector = createSelector(
  [ runtimeEnvironmentsSelector, (state, id) => id ],
  (runtimeEnvironments, id) => runtimeEnvironments.get(id)
);
