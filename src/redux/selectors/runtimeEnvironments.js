import { createSelector } from 'reselect';

const getRuntimeEnvironments = state => state.runtimeEnvironments;

export const runtimeEnvironmentsSelector = state => getRuntimeEnvironments(state).get('resources');

export const runtimeEnvironmentSelector = createSelector(
  runtimeEnvironmentsSelector,
  runtimeEnvironments => id => runtimeEnvironments.get(id)
);
