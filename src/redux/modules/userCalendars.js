import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

export const additionalActionTypes = {
  SET_EXPIRED: 'recodex/userCalendars/SET_EXPIRED',
  SET_EXPIRED_PENDING: 'recodex/userCalendars/SET_EXPIRED_PENDING',
  SET_EXPIRED_FULFILLED: 'recodex/userCalendars/SET_EXPIRED_FULFILLED',
  SET_EXPIRED_REJECTED: 'recodex/userCalendars/SET_EXPIRED_REJECTED',
};

const resourceName = 'userCalendars';
const { actions, actionTypes, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/users/${id}/calendar-tokens/`,
});

export { actionTypes };

/**
 * Actions
 */

export const fetchUserCalendars = actions.fetchResource;
export const fetchUserCalendarsIfNeeded = actions.fetchOneIfNeeded;
export const createUserCalendar = userId => actions.updateResource(userId, {});

export const setUserCalendarExpired = (userId, calendarId) =>
  createApiAction({
    type: additionalActionTypes.SET_EXPIRED,
    endpoint: `/users/ical/${calendarId}`,
    method: 'DELETE',
    meta: { userId, calendarId },
  });

/**
 * Reducer
 */
const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.UPDATE_PENDING]: (state, { meta: { id } }) =>
      state.updateIn(['resources', id, 'data'], calendars => calendars.unshift(null)),

    [actionTypes.UPDATE_REJECTED]: (state, { meta: { id } }) =>
      state.updateIn(['resources', id, 'data'], calendars =>
        calendars.size > 0 && calendars.get(0) === null ? calendars.shift() : calendars
      ),

    [actionTypes.UPDATE_FULFILLED]: (state, { payload, meta: { id } }) =>
      state.updateIn(['resources', id, 'data'], calendars =>
        calendars.size > 0 && calendars.get(0) === null ? calendars.set(0, fromJS(payload)) : calendars
      ),

    [additionalActionTypes.SET_EXPIRED_PENDING]: (state, { meta: { userId, calendarId } }) =>
      state.updateIn(['resources', userId, 'data'], calendars =>
        calendars.map(calendar => (calendar.get('id') === calendarId ? calendar.set('expiring', true) : calendar))
      ),

    [additionalActionTypes.SET_EXPIRED_REJECTED]: (state, { meta: { userId, calendarId } }) =>
      state.updateIn(['resources', userId, 'data'], calendars =>
        calendars.map(calendar => (calendar.get('id') === calendarId ? calendar.set('expiring', false) : calendar))
      ),

    [additionalActionTypes.SET_EXPIRED_FULFILLED]: (state, { payload, meta: { userId, calendarId } }) =>
      state.updateIn(['resources', userId, 'data'], calendars =>
        calendars.map(calendar => (calendar.get('id') === calendarId ? fromJS(payload) : calendar))
      ),
  }),
  initialState
);

export default reducer;
