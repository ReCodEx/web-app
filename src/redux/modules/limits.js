import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { additionalActionTypes as submissionsActionTypes } from './submissions';

const resourceName = 'limits';
const {
  actions,
  actionTypes,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: id => `/exercise-assignments/${id}/limits`
});

/**
 * Actions
 */

export const loadLimits = actions.pushResource;
export const fetchLimitsIfNeeded = actions.fetchOneIfNeeded;

export const editLimits = (assignmentId, payload) => {
  return { type: '@TODO_EDIT_ASSIGNMENT_LIMITS_ACTION', payload };
};

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {
}), initialState);

export default reducer;

