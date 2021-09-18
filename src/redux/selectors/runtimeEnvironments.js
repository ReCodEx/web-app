import { createSelector } from 'reselect';
import { fetchRuntimeEnvironmentsEndpoint } from '../modules/runtimeEnvironments';

const getRuntimeEnvironments = state => state.runtimeEnvironments;

export const runtimeEnvironmentsSelector = state => getRuntimeEnvironments(state).get('resources');

export const runtimeEnvironmentSelector = createSelector(
  runtimeEnvironmentsSelector,
  runtimeEnvironments => id => runtimeEnvironments.get(id)
);

export const fetchRuntimeEnvironmentsStatus = createSelector(getRuntimeEnvironments, state =>
  state.getIn(['fetchManyStatus', fetchRuntimeEnvironmentsEndpoint])
);
