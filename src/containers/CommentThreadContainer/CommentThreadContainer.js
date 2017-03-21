import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { postComment, repostComment, togglePrivacy, fetchThreadIfNeeded, updateThread } from '../../redux/modules/comments';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { commentsThreadSelector } from '../../redux/selectors/comments';

import CommentThread, {
  LoadingCommentThread,
  FailedCommentThread
} from '../../components/AdminLTE/Comments/CommentThread';

import ResourceRenderer from '../../components/ResourceRenderer';

/**
 * Used  to create a discussion thread. A unique identification must be
 * assigned to every thread so the comments in the distinct threads do
 * not interleave.
 */
class CommentThreadContainer extends Component {

  componentWillMount() {
    CommentThreadContainer.loadData(this.props);
    this.pollInterval = setInterval(() => this.poll(), 60000); // once a minute
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.threadId !== newProps.threadId) {
      CommentThreadContainer.loadData(newProps);
    }
  }

  /**
   * Periodically ask for new comments.
   */
  poll() {
    this.props.poll();
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

    return (
      <ResourceRenderer
        resource={[ thread, user ]}
        loading={<LoadingCommentThread />}
        failed={<FailedCommentThread />}>
        {(thread, user) => (
          <CommentThread
            comments={thread.comments.sort((a, b) => a.postedAt - b.postedAt)}
            currentUserId={user.id}
            addComment={(text, isPrivate) => addComment(user, text, isPrivate)}
            togglePrivacy={togglePrivacy}
            repostComment={repostComment} />
        )}
      </ResourceRenderer>
    );
  }

}

CommentThreadContainer.propTypes = {
  threadId: PropTypes.string.isRequired,
  thread: PropTypes.object,
  user: PropTypes.object,
  addComment: PropTypes.func.isRequired,
  repostComment: PropTypes.func,
  togglePrivacy: PropTypes.func,
  poll: PropTypes.func.isRequired
};

export default connect(
  (state, { threadId }) => ({
    user: loggedInUserSelector(state),
    thread: commentsThreadSelector(state, threadId)
  }),
  (dispatch, { threadId }) => ({
    addComment: (user, text, isPrivate) => dispatch(postComment(user, threadId, text, isPrivate)),
    repostComment: (tmpId) => dispatch(repostComment(threadId, tmpId)),
    togglePrivacy: (id) => dispatch(togglePrivacy(threadId, id)),
    loadThreadIfNeeded: () => dispatch(fetchThreadIfNeeded(threadId)),
    poll: () => dispatch(updateThread(threadId))
  })
)(CommentThreadContainer);
