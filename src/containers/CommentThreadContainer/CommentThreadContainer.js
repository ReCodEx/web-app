import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { isLoading, hasFailed, isReady } from '../../redux/helpers/resourceManager';
import { postComment, repostComment, togglePrivacy, fetchThreadIfNeeded } from '../../redux/modules/comments';
import { loggedInUserId } from '../../redux/selectors/auth';
import { loggedInUserDataSelector } from '../../redux/selectors/users';
import { commentsThreadSelector } from '../../redux/selectors/comments';

import CommentThread, {
  LoadingCommentThread,
  FailedCommentThread
} from '../../components/AdminLTE/Comments/CommentThread';

class CommentThreadContainer extends Component {

  componentWillMount() {
    CommentThreadContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.threadId !== newProps.threadId) {
      CommentThreadContainer.loadData(newProps);
    }
  }

  static loadData = ({ loadThreadIfNeeded }) => {
    loadThreadIfNeeded();
  };

  render() {
    const {
      thread,
      user,
      addComment,
      repostComment,
      togglePrivacy
    } = this.props;

    if (isLoading(thread)) {
      return <LoadingCommentThread />;
    }

    if (hasFailed(thread)) {
      return <FailedCommentThread />;
    }

    return (
      <CommentThread
        comments={thread.getIn(['data', 'comments']).toJS()}
        currentUserId={user.id}
        addComment={user ? (text, isPrivate) => addComment(user, text, isPrivate) : null}
        togglePrivacy={user ? (id) => togglePrivacy(id) : null}
        repostComment={repostComment} />
    );
  }

}

CommentThreadContainer.propTypes = {
  threadId: PropTypes.string.isRequired,
  thread: PropTypes.object,
  user: PropTypes.object,
  addComment: PropTypes.func.isRequired,
  repost: PropTypes.func
};

export default connect(
  (state, { threadId }) => ({
    user: loggedInUserDataSelector(state).toJS(),
    thread: commentsThreadSelector(state, threadId)
  }),
  (dispatch, { threadId }) => ({
    addComment: (user, text, isPrivate) => dispatch(postComment(user, threadId, text, isPrivate)),
    repostComment: (tmpId) => dispatch(repostComment(threadId, tmpId)),
    togglePrivacy: (id) => dispatch(togglePrivacy(threadId, id)),
    loadThreadIfNeeded: () => dispatch(fetchThreadIfNeeded(threadId))
  })
)(CommentThreadContainer);
