import { createSelector } from 'reselect';
import { getJsData } from '../helpers/resourceManager';

/**
 * Public selectors
 */

export const statisticsSelector = state => state.stats.get('resources');

export const createGroupsStatsSelector = groupId =>
  createSelector(statisticsSelector, stats => stats.get(groupId));

const getGroupsStatsData = groupId =>
  createSelector(createGroupsStatsSelector(groupId), getJsData);

export const getUsersStatistics = (groupId, userId) =>
  createSelector(
    getGroupsStatsData(groupId),
    group =>
      group !== null ? group.find(stats => stats.userId === userId) : null
  );

export const getStatuses = (groupId, userId) =>
  createSelector(
    getUsersStatistics(groupId, userId),
    stats => (stats ? stats.statuses : {})
  );
