import { handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';
import factory, { initialState, resourceStatus } from '../helpers/resourceManager';
import {
  actionTypes as solutionActionTypes,
  additionalActionTypes as additionalSolutionsActionTypes,
} from './solutions.js';
import { additionalActionTypes as additonalShadowAssignmentsActionTypes } from './shadowAssignments.js';

/**
 * Create actions & reducer
 */

const resourceName = 'stats';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: groupId => `/groups/${groupId}/students/stats`,
});

export const fetchGroupStats = actions.fetchResource;
export const fetchGroupStatsIfNeeded = actions.fetchOneIfNeeded;

// Reducers helpers

const _getCurrentPoints = (userStats, shadowAssignmentId) => {
  const shadowAssignment = userStats
    .get('shadowAssignments')
    .find(shadowStats => shadowStats.get('id') === shadowAssignmentId);
  const points = shadowAssignment && shadowAssignment.getIn(['points', 'gained'], 0);
  return points ? Number(points) : 0;
};

const handleShadowPointsModification = (state, { meta: { groupId, shadowAssignmentId, userId, points } }) =>
  state.getIn(['resources', groupId, 'state']) === resourceStatus.FULFILLED
    ? state.updateIn(['resources', groupId, 'data'], stats =>
        stats.map(userStats =>
          userStats.get('userId') === userId
            ? userStats
                .updateIn(
                  ['points', 'gained'],
                  totalGained => totalGained + Number(points) - _getCurrentPoints(userStats, shadowAssignmentId)
                )
                .update('shadowAssignments', shadowAssignment =>
                  shadowAssignment.map(shadowStats =>
                    shadowStats.get('id') === shadowAssignmentId
                      ? shadowStats.setIn(['points', 'gained'], points)
                      : shadowStats
                  )
                )
            : userStats
        )
      )
    : state;

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [solutionActionTypes.REMOVE_FULFILLED]: (state, { meta: { groupId } }) =>
      state.hasIn(['resources', groupId]) ? state.setIn(['resources', groupId, 'didInvalidate'], true) : state,

    [additionalSolutionsActionTypes.SET_FLAG_FULFILLED]: (state, { payload: { stats: newStats } }) =>
      newStats
        ? state.updateIn(['resources', newStats.groupId, 'data'], stats => {
            if (!stats) {
              stats = List();
            }
            return stats.filter(userStats => userStats.get('userId') !== newStats.userId).push(fromJS(newStats));
          })
        : state,

    [additonalShadowAssignmentsActionTypes.CREATE_POINTS_FULFILLED]: handleShadowPointsModification,
    [additonalShadowAssignmentsActionTypes.UPDATE_POINTS_FULFILLED]: handleShadowPointsModification,
    [additonalShadowAssignmentsActionTypes.REMOVE_POINTS_FULFILLED]: handleShadowPointsModification,
  }),
  initialState
);
export default reducer;
