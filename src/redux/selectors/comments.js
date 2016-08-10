import { createSelector } from 'reselect';
import { List } from 'immutable';
import { isReady } from '../helpers/resourceManager';


/**
 * Select groups part of the state
 */

const getComments = state => state.comments;

export const commentsThreadSelector = createSelector(
  [ getComments, (state, threadId) => threadId ],
  (comments, threadId) => comments.getIn([ 'resources', threadId ])
);

export const commentsSelector = createSelector(
  commentsThreadSelector,
  thread => thread.getIn([ 'data', 'comments' ])
);
