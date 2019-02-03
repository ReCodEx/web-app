import { createSelector } from 'reselect';

const getBrokerStats = state => state.broker;

export const brokerStatsSelector = createSelector(getBrokerStats, broker =>
  broker.getIn(['resources', 'stats'])
);
