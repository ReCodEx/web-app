import { createSelector } from 'reselect';

const getBrokerStats = state => state.broker;

export const brokerStatsSelector = createSelector(
  getBrokerStats,
  broker => broker.get('stats')
);

export const brokerFreezeSelector = createSelector(
  getBrokerStats,
  broker => broker.get('freezeActionStatus')
);

export const brokerUnfreezeSelector = createSelector(
  getBrokerStats,
  broker => broker.get('unfreezeActionStatus')
);
