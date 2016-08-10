import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState, createRecord } from '../helpers/resourceManager';
import { commentsSelector } from '../selectors/comments';

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
    endpoint: `/comments/${threadId}`,
    method: 'POST',
    body: { text, isPrivate: isPrivate ? 'yes' : 'no' },
    meta: { threadId, user, tmpId: Math.random().toString() }
  });

export const repostComment = (threadId, tmpId) =>
  (dispatch, getState) => {
    const comment = commentsSelector(getState(), threadId).find(cmt => cmt.get('id') === tmpId);
    if (comment) {
      dispatch({ type: actionTypes.REMOVE_COMMENT, payload: { threadId, id: tmpId } });
      dispatch(
        postComment(comment.get('user'), threadId, comment.get('text'), comment.get('isPrivate'))
      ).catch(() => {});
    }
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
    const resource = fromJS({ id: tmpId, status: 'pending', text, user: correctUserData, isPrivate: isPrivate === 'yes' });
    return state.updateIn(
      ['resources', threadId, 'data', 'comments'],
      comments => comments.push(resource)
    );
  },

  [actionTypes.POST_COMMENT_FULFILLED]: (state, { payload, meta: { threadId, tmpId } }) => {
    return state.updateIn(
      ['resources', threadId, 'data', 'comments'],
      comments => comments.map(comment => comment.get('id') === tmpId ? fromJS(payload) : comment)
    );
  },

  [actionTypes.POST_COMMENT_REJECTED]: (state, { meta: { threadId, tmpId } }) => {
    return state.updateIn(
      ['resources', threadId, 'data', 'comments'],
      comments => comments.map(comment => comment.get('id') === tmpId ? comment.set('status', 'failed') : comment)
    );
  },

  [actionTypes.REMOVE_COMMENT]: (state, { meta: { threadId, id } }) => {
    return state.updateIn(
      ['resources', threadId, 'data', 'comments'],
      comments => comments.filter(cmt => cmt.get('id') !== id)
    );
  }

}), initialState);

export default reducer;
