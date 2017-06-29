import { handleActions } from 'redux-actions';
import factory, {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';

import { actionTypes as userActionTypes } from './users';

const resourceName = 'public-profiles';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: userId => `/users/${userId}/public`
});

/**
 * Actions
 */

export const fetchProfilesIfNeeded = actions.fetchIfNeeded;
export const fetchProfileIfNeeded = actions.fetchOneIfNeeded;

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [userActionTypes.FETCH_FULFILLED]: (
      state,
      { payload: { id, fullName, avatarUrl, isVerified = false } }
    ) =>
      state.setIn(
        ['resources', id],
        createRecord({
          data: { id, fullName, avatarUrl, isVerified },
          state: resourceStatus.FULFILLED
        })
      )
  }),
  initialState
);

export default reducer;
