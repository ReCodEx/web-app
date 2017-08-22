import { createSelector } from 'reselect';

const getRuntimeEnvironments = state => state.runtimeEnvironments;
const getResources = runtimeEnvironments =>
  runtimeEnvironments.get('resources');

export const runtimeEnvironmentsSelector = createSelector(
  getRuntimeEnvironments,
  getResources
);
export const runtimeEnvironmentSelector = environmentId =>
  createSelector(runtimeEnvironmentsSelector, runtimeEnvironments =>
    runtimeEnvironments.get(environmentId)
  );
