import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState, createRecord } from '../helpers/resourceManager';

const resourceName = 'comments';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  POST_COMMENT: 'redux/comments/POST_COMMENT',
  POST_COMMENT_PENDING: 'redux/comments/POST_COMMENT_PENDING',
  POST_COMMENT_REJECTED: 'redux/comments/POST_COMMENT_REJECTED',
  POST_COMMENT_FULFILLED: 'redux/comments/POST_COMMENT_FULFILLED',
  REMOVE_COMMENT: 'redux/comment/REMOVE_COMMENT'
};

export const fetchThreadIfNeeded = actions.fetchOneIfNeeded;

export const postComment = (user, threadId, text, isPrivate) =>
  createApiAction({
    type: actionTypes.POST_COMMENT,
    endpoint: `/comments/${threadId}/add`,
    method: 'POST',
    body: { text, isPrivate: isPrivate ? 'yes' : 'no' },
    meta: { threadId, user, tmpId: Math.random().toString() }
  });

export const repostComment = (threadId, tmpId) =>
  (dispatch, getState) => {
    const comment = getState().comments.getIn([ 'resources', threadId ])
                      .data.comments.find(cmt => cmt.id === tmpId);
    dispatch({ type: actionTypes.REMOVE_COMMENT, payload: { threadId, id: tmpId } });
    dispatch(postComment(comment.user, threadId, comment.text, comment.isPrivate)).catch(() => {});
  };

export const togglePrivacy = (commentId) =>
  createApiAction({
    type: actionTypes.TOGGLE_PRIVACY,
    endpoint: `/comments/${commentId}/toggle`,
    method: 'POST'
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [actionTypes.POST_COMMENT_PENDING]: (state, { payload: { text, isPrivate }, meta: { tmpId, user, threadId } }) => {
    const correctUserData = Object.assign({}, user, { name: user.fullName || user.name });
    const resource = { id: tmpId, status: 'pending', text, user: correctUserData, isPrivate: isPrivate === 'yes' };
    return state.updateIn(
      ['resources', threadId],
      thread => {
        const copy = Object.assign({}, thread);
        copy.data = copy.data || { comments: [] };
        copy.data.comments.push(resource);
        return copy;
      }
    );
  },

  [actionTypes.POST_COMMENT_FULFILLED]: (state, { payload, meta: { threadId, tmpId } }) => {
    return state.updateIn(
      ['resources', threadId],
      thread => {
        const copy = Object.assign({}, thread);
        copy.data.comments = thread.data.comments.map(
          cmt => cmt.id !== tmpId ? cmt : payload
        );
        return copy;
      }
    );
  },

  [actionTypes.POST_COMMENT_REJECTED]: (state, { meta: { threadId, tmpId } }) => {
    return state.updateIn(
      ['resources', threadId],
      thread => {
        const copy = Object.assign({}, thread);
        copy.data.comments = copy.data.comments.map(
          cmt => cmt.id !== tmpId ? cmt : Object.assign({}, cmt, { status: 'failed' })
        );
        return copy;
      }
    );
  },

  [actionTypes.REMOVE_COMMENT]: (state, { meta: { threadId, id } }) => {
    return state.updateIn(
      ['resources', threadId],
      thread => {
        const copy = Object.assign({}, thread);
        copy.data.comments = copy.data.comments.filter(cmt => cmt.id !== id);
        return copy;
      }
    );
  }

}), initialState);

export default reducer;
