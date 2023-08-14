import { createSelector } from 'reselect';

import { EMPTY_LIST, EMPTY_OBJ } from '../../helpers/common';
import { isReady, getJsData } from '../helpers/resourceManager';
import { isStudentRole, isSupervisorRole, isSuperadminRole } from '../../components/helpers/usersRoles';

import { fetchManyEndpoint } from '../modules/users';
import { loggedInUserIdSelector, accessTokenSelector } from './auth';
import { pipelineSelector } from './pipelines';
import { getLang } from './app';

const getParam = (state, id) => id;

const getUsers = state => state.users;
const getResources = users => users.get('resources');

/**
 * Select users part of the state
 */
export const usersSelector = createSelector(getUsers, getResources);

export const fetchManyStatus = createSelector(getUsers, state => state.getIn(['fetchManyStatus', fetchManyEndpoint]));

export const fetchUserStatus = createSelector([usersSelector, getParam], (users, id) => users.getIn([id, 'state']));

export const getUser = userId => createSelector(usersSelector, users => users.get(userId));
export const getUserSelector = createSelector(usersSelector, users => userId => users.get(userId));
export const getReadyUserSelector = createSelector(usersSelector, users => userId => {
  const user = users.get(userId);
  return user && isReady(user) ? getJsData(user) : null;
});

export const readyUsersDataSelector = createSelector([usersSelector, getLang], (users, lang) =>
  users
    .toList()
    .filter(isReady)
    .map(getJsData)
    .sort(
      (a, b) =>
        a.name.lastName.localeCompare(b.name.lastName, lang) || a.name.firstName.localeCompare(b.name.firstName, lang)
    )
    .toArray()
);

export const isVerified = userId =>
  createSelector(getUser(userId), user => (user ? user.getIn(['data', 'isVerified']) === true : false));

export const getRole = userId =>
  createSelector(getUser(userId), user => (user ? user.getIn(['data', 'privateData', 'role']) : null));

export const isStudent = userId => createSelector(getRole(userId), role => isStudentRole(role));

export const isSupervisor = userId => createSelector(getRole(userId), role => isSupervisorRole(role));

const userSettingsSelector = user => {
  const settings = isReady(user) && user.getIn(['data', 'privateData', 'settings']);
  return settings ? settings.toJS() : EMPTY_OBJ;
};
const userUIDataSelector = user => {
  const settings = isReady(user) && user.getIn(['data', 'privateData', 'uiData']);
  return settings ? settings.toJS() : EMPTY_OBJ;
};

export const getUserSettings = userId => createSelector(getUser(userId), userSettingsSelector);
export const getUserUIData = userId => createSelector(getUser(userId), userUIDataSelector);

export const loggedInUserSelector = createSelector([usersSelector, loggedInUserIdSelector], (users, id) =>
  id && users ? users.get(id) : null
);

export const getLoggedInUserSettings = createSelector(loggedInUserSelector, userSettingsSelector);
export const getLoggedInUserUiData = createSelector(loggedInUserSelector, userUIDataSelector);

export const getLoggedInUserEffectiveRole = createSelector(
  [loggedInUserSelector, accessTokenSelector],
  (loggedInUser, token) =>
    (token && token.get('effrole')) ||
    (loggedInUser && isReady(loggedInUser) && loggedInUser.getIn(['data', 'privateData', 'role'])) ||
    null
);

export const isLoggedAsSuperAdmin = createSelector(getLoggedInUserEffectiveRole, effectiveRole =>
  isSuperadminRole(effectiveRole)
);

export const isLoggedAsStudent = createSelector(getLoggedInUserEffectiveRole, effectiveRole =>
  isStudentRole(effectiveRole)
);

export const memberOfInstancesIdsSelector = userId =>
  createSelector(getUser(userId), user =>
    user && isReady(user) ? user.getIn(['data', 'privateData', 'instancesIds'], EMPTY_LIST) : EMPTY_LIST
  );

export const canEditPipeline = (userId, pipelineId) =>
  createSelector(
    [pipelineSelector(pipelineId), isLoggedAsSuperAdmin],
    (pipeline, isSuperAdmin) =>
      isSuperAdmin || (pipeline && isReady(pipeline) && pipeline.getIn(['data', 'author']) === userId)
  );

export const notificationsSelector = createSelector(loggedInUserSelector, user =>
  user && user.get('data') && user.getIn(['data', 'groupsStats'])
    ? user.getIn(['data', 'groupsStats'], EMPTY_LIST).reduce(
        (notifications, group) =>
          Object.assign({}, notifications, {
            [group.id]:
              group.stats.assignments.total - group.stats.assignments.completed - group.stats.assignments.missed,
          }),
        {}
      )
    : EMPTY_OBJ
);

export const userIsAllowed = createSelector(usersSelector, users => id => {
  const user = users && users.get(id);
  return user && isReady(user) ? user.getIn(['data', 'privateData', 'isAllowed'], null) : null;
});

export const userIsAllowedPending = createSelector(usersSelector, users => id => {
  const user = users && users.get(id);
  return user && isReady(user) ? user.getIn(['data', 'isAllowed-pending'], false) : null;
});
