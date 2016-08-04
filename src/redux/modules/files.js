import { createAction, handleActions } from 'redux-actions';
import factory, { initialState, createRecord, defaultNeedsRefetching } from '../helpers/resourceManager';
import { actionTypes as submissionActionTypes } from './submissions';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'files';
const {
  actions,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: (id) => `/uploaded-files/${id}`
});

/**
 * Actions
 */

export const loadFile = actions.pushResource;
export const fetchFileIfNeeded = actions.fetchOneIfNeeded;

export const additionalActionTypes = {
  LOAD_CONTENT: 'recodex/files/LOAD_CONTENT',
  LOAD_CONTENT_PENDING: 'recodex/files/LOAD_CONTENT_PENDING',
  LOAD_CONTENT_FULFILLED: 'recodex/files/LOAD_CONTENT_FULFILLED',
  LOAD_CONTENT_FAILED: 'recodex/files/LOAD_CONTENT_FAILED'
};

export const fetchContent = (id) =>
  createApiAction({
    type: additionalActionTypes.LOAD_CONTENT,
    endpoint: `/uploaded-files/${id}/content`,
    method: 'GET',
    meta: { id }
  });

const getContent = (id, getState) =>
  getState().files.getIn(['content', id]);

export const fetchContentIfNeeded = (id) =>
  (dispatch, getState) => {
    if (defaultNeedsRefetching(getContent(id, getState))) {
      dispatch(fetchContent(id));
    }
  };

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [additionalActionTypes.LOAD_CONTENT_PENDING]: (state, { meta: { id } }) =>
    state.setIn(['content', id], createRecord(true, false, false, null)),

  [additionalActionTypes.LOAD_CONTENT_FAILED]: (state, { meta: { id } }) =>
    state.setIn(['content', id], createRecord(false, true, false, null)),

  [additionalActionTypes.LOAD_CONTENT_FULFILLED]: (state, { payload, meta: { id } }) =>
    state.setIn(['content', id], createRecord(false, false, false, payload))

}), initialState);

export default reducer;
