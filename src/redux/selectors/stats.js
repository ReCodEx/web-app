import { createSelector } from 'reselect';
import { getJsData } from '../helpers/resourceManager';

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

const getGroupsStatsData = groupId =>
  createSelector(
    createGroupsStatsSelector(groupId),
    getJsData
  );

export const getStatuses = (groupId, userId) =>
  createSelector(
    getGroupsStatsData(groupId),
    groupsStats => {
      const stats = groupsStats !== null ? groupsStats.find(stats => stats.userId === userId) || {} : {};
      let { statuses = {} } = stats;
      if (statuses.length === 0) {
        statuses = {};
      }

      return statuses;
    },
  );
