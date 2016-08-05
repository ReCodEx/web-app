import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { isLoading, hasFailed, isReady } from '../../redux/helpers/resourceManager';
import { postComment, fetchThreadIfNeeded } from '../../redux/modules/comments';
import { loggedInUserId } from '../../redux/selectors/auth';
import { loggedInUserSelector } from '../../redux/selectors/users';

import CommentThread, {
  LoadingCommentThread,
  FailedCommentThread
} from '../../components/Comments/CommentThread';

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
      addComment
    } = this.props;

    if (isLoading(thread)) {
      return null; // @todo Loading component
    }

    if (hasFailed(thread)) {
      return null; // @todo Failed component
    }

    return (
      <CommentThread
        comments={thread.data.comments}
        currentUserId={user.id}
        addComment={user ? text => addComment(user, text) : null} />
    );
  }

}

CommentThreadContainer.propTypes = {
  threadId: PropTypes.string.isRequired,
  thread: PropTypes.object,
  user: PropTypes.object,
  addComment: PropTypes.func.isRequired
};

export default connect(
  (state, { threadId }) => ({
    user: loggedInUserSelector(state),
    thread: state.comments.getIn(['resources', threadId])
  }),
  (dispatch, { threadId }) => ({
    addComment: (user, text) => dispatch(postComment(user, threadId, text)),
    loadThreadIfNeeded: () => dispatch(fetchThreadIfNeeded(threadId))
  })
)(CommentThreadContainer);
