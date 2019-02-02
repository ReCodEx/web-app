import { createSelector } from 'reselect';

const getBrokerStats = state => state.brokerStats;

export const brokerStatsSelector = createSelector(getBrokerStats, stats =>
  stats.get('resources')
);
