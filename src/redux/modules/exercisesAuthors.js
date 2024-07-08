import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { createApiAction } from '../middleware/apiMiddleware.js';
import { createRecord, resourceStatus, defaultNeedsRefetching, isLoading, getJsData } from '../helpers/resourceManager';
import { selectedInstanceId } from '../selectors/auth.js';

export const actionTypes = {
  FETCH: 'recodex/exercisesAuthors/FETCH',
  FETCH_PENDING: 'recodex/exercisesAuthors/FETCH_PENDING',
  FETCH_FULFILLED: 'recodex/exercisesAuthors/FETCH_FULFILLED',
  FETCH_REJECTED: 'recodex/exercisesAuthors/FETCH_REJECTED',
};

const createInitialState = (instanceId = null) =>
  fromJS({
    instanceId,
    all: createRecord({ state: null, lastUpdate: 0 }), // all authors for selected instance
    groups: {}, // authors for exercises seen in particular groups
  });

const itemPath = groupId => (groupId ? ['groups', groupId] : ['all']);

const fakeResult = item => ({
  value: getJsData(item),
});

const archivedPromises = {};

export const fetchExercisesAuthors =
  (groupId = null) =>
  (dispatch, getState) => {
    const instanceId = selectedInstanceId(getState());
    const query = { instanceId };
    if (groupId) {
      query.groupId = groupId;
    }
    archivedPromises[groupId] = dispatch(
      createApiAction({
        type: actionTypes.FETCH,
        endpoint: '/exercises/authors',
        meta: { instanceId, groupId },
        query,
      })
    );
    return archivedPromises[groupId];
  };

export const fetchExercisesAuthorsIfNeeded = groupId => (dispatch, getState) => {
  const item = getState().exercisesAuthors.getIn(itemPath(groupId));
  if (!defaultNeedsRefetching(item)) {
    return fakeResult(item);
  }
  return item && isLoading(item) ? archivedPromises[groupId] : fetchExercisesAuthors(groupId)(dispatch, getState);
};

/*
 * Reductors
 */

export default handleActions(
  {
    [actionTypes.FETCH_PENDING]: (state, { meta: { instanceId, groupId } }) => {
      if (state.get('instanceId') !== instanceId) {
        state = createInitialState(instanceId);
      }
      return state.setIn(
        itemPath(groupId),
        createRecord({
          state: resourceStatus.PENDING,
        })
      );
    },

    [actionTypes.FETCH_FULFILLED]: (state, { meta: { instanceId, groupId }, payload }) => {
      if (state.get('instanceId') !== instanceId) {
        return state;
      }

      return state.setIn(
        itemPath(groupId),
        createRecord({
          state: resourceStatus.FULFILLED,
          data: payload.map(author => author.id),
        })
      );
    },

    [actionTypes.FETCH_REJECTED]: (state, { meta: { instanceId, groupId } }) => {
      if (state.get('instanceId') !== instanceId) {
        return state;
      }
      return state.setIn(itemPath(groupId), createRecord({ state: resourceStatus.FAILED }));
    },
  },
  createInitialState()
);
