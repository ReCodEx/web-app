const getBrokerStats = state => state.brokerStats;

export const brokerStatsSelector = state =>
  getBrokerStats(state).get('resources');
