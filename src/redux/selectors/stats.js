import { createSelector } from 'reselect';

const getStats = state => state.stats;

const getResources = createSelector(
  getStats,
  stats => stats.get('resources')
);

/**
 * Public selectors
 */

export const createGroupsStatsSelector = groupId =>
  createSelector(
    getResources,
    stats => stats.get(groupId)
  );
