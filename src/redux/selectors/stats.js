import { createSelector } from 'reselect';
import { EMPTY_LIST, EMPTY_OBJ } from '../../helpers/common.js';
import { getJsData } from '../helpers/resourceManager';
import { loggedInUserIdSelector } from './auth.js';

/**
 * Public selectors
 */

const getParam = (state, id) => id;

export const statisticsSelector = state => state.stats.get('resources');

export const createGroupsStatsSelector = groupId => createSelector(statisticsSelector, stats => stats.get(groupId));

const getGroupsStatsData = groupId => createSelector(createGroupsStatsSelector(groupId), getJsData);

export const getUsersStatistics = (groupId, userId) =>
  createSelector(getGroupsStatsData(groupId), group =>
    group !== null ? group.find(stats => stats.userId === userId) : null
  );

export const getStatuses = (groupId, userId) =>
  createSelector(getUsersStatistics(groupId, userId), stats => (stats ? stats.statuses : EMPTY_OBJ));

export const getStatusesForLoggedUser = createSelector(
  [statisticsSelector, loggedInUserIdSelector, getParam],
  (stats, userId, groupId) => {
    const data = stats.getIn([groupId, 'data'], EMPTY_LIST);
    if (data !== null) {
      const statObj = data.toJS().find(stats => stats.userId === userId);
      return statObj ? statObj.assignments : EMPTY_OBJ;
    }
    return EMPTY_OBJ;
  }
);
