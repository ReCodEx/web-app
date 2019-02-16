import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState } from '../helpers/resourceManager';
import { commentsSelector } from '../selectors/comments';

const resourceName = 'comments';
const { actions, actionTypes: resourceActionTypes, reduceActions } = factory({
  resourceName,
  needsRefetching: () => true, // always look for newer comments
});

/**
 * Actions
 */

export const actionTypes = {
  UPDATE: 'redux/comments/UPDATE',
  UPDATE_FULFILLED: 'redux/comments/UPDATE_FULFILLED',
  POST_COMMENT: 'redux/comments/POST_COMMENT',
  POST_COMMENT_PENDING: 'redux/comments/POST_COMMENT_PENDING',
  POST_COMMENT_REJECTED: 'redux/comments/POST_COMMENT_REJECTED',
  POST_COMMENT_FULFILLED: 'redux/comments/POST_COMMENT_FULFILLED',
  TOGGLE_PRIVACY: 'redux/comment/TOGGLE_PRIVACY',
  TOGGLE_PRIVACY_PENDING: 'redux/comment/TOGGLE_PRIVACY_PENDING',
  TOGGLE_PRIVACY_FULFILLED: 'redux/comment/TOGGLE_PRIVACY_FULFILLED',
  TOGGLE_PRIVACY_REJECTED: 'redux/comment/TOGGLE_PRIVACY_REJECTED',
  DELETE_COMMENT: 'redux/comment/DELETE_COMMENT',
  DELETE_COMMENT_PENDING: 'redux/comment/DELETE_COMMENT_PENDING',
  DELETE_COMMENT_FULFILLED: 'redux/comment/DELETE_COMMENT_FULFILLED',
  DELETE_COMMENT_REJECTED: 'redux/comment/DELETE_COMMENT_REJECTED',
};

export const fetchThreadIfNeeded = actions.fetchOneIfNeeded;

export const updateThread = id =>
  createApiAction({
    type: actionTypes.UPDATE,
    endpoint: `/comments/${id}`,
    meta: { id },
  });

export const postComment = (user, threadId, text, isPrivate) =>
  createApiAction({
    type: actionTypes.POST_COMMENT,
    endpoint: `/comments/${threadId}`,
    method: 'POST',
    body: { text, isPrivate: isPrivate ? 'yes' : 'no' },
    meta: { threadId, user, tmpId: Math.random().toString() },
  });

export const repostComment = (threadId, tmpId) => (dispatch, getState) => {
  const comment = commentsSelector(getState(), threadId).find(cmt => cmt.get('id') === tmpId);
  if (comment) {
    dispatch({
      type: actionTypes.REMOVE_COMMENT,
      payload: { threadId, id: tmpId },
    });
    dispatch(postComment(comment.get('user'), threadId, comment.get('text'), comment.get('isPrivate'))).catch(() => {});
  }
};

export const togglePrivacy = (threadId, commentId) =>
  createApiAction({
    type: actionTypes.TOGGLE_PRIVACY,
    endpoint: `/comments/${threadId}/comment/${commentId}/toggle`,
    method: 'POST',
    meta: { threadId, commentId },
  });

export const deleteComment = (threadId, commentId) =>
  createApiAction({
    type: actionTypes.DELETE_COMMENT,
    endpoint: `/comments/${threadId}/comment/${commentId}`,
    method: 'DELETE',
    meta: { threadId, commentId },
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.UPDATE_FULFILLED]: reduceActions[resourceActionTypes.FETCH_FULFILLED],

    [actionTypes.POST_COMMENT_PENDING]: (state, { payload: { text, isPrivate }, meta: { tmpId, user, threadId } }) => {
      const correctUserData = Object.assign({}, user, {
        name: user.fullName || user.name,
      });
      const resource = fromJS({
        id: tmpId,
        status: 'pending',
        text,
        user: correctUserData,
        isPrivate: isPrivate === 'yes',
      });
      return state.updateIn(['resources', threadId, 'data', 'comments'], comments => comments.push(resource));
    },

    [actionTypes.POST_COMMENT_FULFILLED]: (state, { payload, meta: { threadId, tmpId } }) => {
      return state.updateIn(['resources', threadId, 'data', 'comments'], comments =>
        comments.map(comment => (comment.get('id') === tmpId ? fromJS(payload) : comment))
      );
    },

    [actionTypes.POST_COMMENT_REJECTED]: (state, { meta: { threadId, tmpId } }) => {
      return state.updateIn(['resources', threadId, 'data', 'comments'], comments =>
        comments.map(comment => (comment.get('id') === tmpId ? comment.set('status', 'failed') : comment))
      );
    },

    [actionTypes.TOGGLE_PRIVACY_PENDING]: (state, { payload, meta: { threadId, commentId } }) => {
      return state.updateIn(['resources', threadId, 'data', 'comments'], comments =>
        comments.map(comment => (comment.get('id') === commentId ? comment.set('isToggling', true) : comment))
      );
    },

    [actionTypes.TOGGLE_PRIVACY_FULFILLED]: (state, { payload, meta: { threadId, commentId } }) => {
      return state.updateIn(['resources', threadId, 'data', 'comments'], comments =>
        comments.map(comment => (comment.get('id') === commentId ? fromJS(payload) : comment))
      );
    },

    [actionTypes.TOGGLE_PRIVACY_REJECTED]: (state, { payload, meta: { threadId, commentId } }) => {
      return state.updateIn(['resources', threadId, 'data', 'comments'], comments =>
        comments.map(comment => (comment.get('id') === commentId ? comment.set('isToggling', false) : comment))
      );
    },

    [actionTypes.DELETE_COMMENT_FULFILLED]: (state, { meta: { threadId, commentId } }) => {
      return state.updateIn(['resources', threadId, 'data', 'comments'], comments =>
        comments.filter(cmt => cmt.get('id') !== commentId)
      );
    },
  }),
  initialState
);

export default reducer;
