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

export const getUsersStatistics = (groupId, userId) =>
  createSelector(
    getGroupsStatsData(groupId),
    (group) => group !== null ? group.find(stats => stats.userId === userId) : null
  );

export const getStatuses = (groupId, userId) =>
  createSelector(
    getUsersStatistics(groupId, userId),
    (stats) => stats ? stats.statuses : {}
  );
