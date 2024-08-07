import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import {
  postComment,
  repostComment,
  setPrivacy,
  fetchThreadIfNeeded,
  updateThread,
  deleteComment,
} from '../../redux/modules/comments.js';
import { loggedInUserSelector } from '../../redux/selectors/users.js';
import { commentsThreadSelector } from '../../redux/selectors/comments.js';

import CommentThread, {
  LoadingCommentThread,
  FailedCommentThread,
} from '../../components/widgets/Comments/CommentThread';

import ResourceRenderer from '../../components/helpers/ResourceRenderer';

/**
 * Used  to create a discussion thread. A unique identification must be
 * assigned to every thread so the comments in the distinct threads do
 * not interleave.
 */
class CommentThreadContainer extends Component {
  componentDidMount() {
    CommentThreadContainer.loadData(this.props);
  }

  static loadData = ({ loadThreadIfNeeded }) => {
    loadThreadIfNeeded();
  };

  render() {
    const {
      title = <FormattedMessage id="app.comments.title" defaultMessage="Comments and Notes" />,
      additionalPublicSwitchNote = null,
      thread,
      user,
      addComment,
      repostComment,
      setPrivacy,
      refresh,
      deleteComment,
      displayAs = 'box',
    } = this.props;

    return (
      <ResourceRenderer resource={[thread, user]} loading={<LoadingCommentThread />} failed={<FailedCommentThread />}>
        {(thread, user) => (
          <CommentThread
            title={title}
            additionalPublicSwitchNote={additionalPublicSwitchNote}
            comments={thread.comments.sort((a, b) => a.postedAt - b.postedAt)}
            currentUserId={user.id}
            addComment={(text, isPrivate) => addComment(user, text, isPrivate)}
            setPrivacy={setPrivacy}
            repostComment={repostComment}
            refresh={refresh}
            deleteComment={deleteComment}
            displayAs={displayAs}
          />
        )}
      </ResourceRenderer>
    );
  }
}

CommentThreadContainer.propTypes = {
  threadId: PropTypes.string.isRequired,
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  additionalPublicSwitchNote: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  displayAs: PropTypes.string,
  thread: PropTypes.object,
  user: PropTypes.object,
  addComment: PropTypes.func.isRequired,
  repostComment: PropTypes.func,
  setPrivacy: PropTypes.func,
  refresh: PropTypes.func,
  deleteComment: PropTypes.func,
};

export default connect(
  (state, { threadId }) => ({
    user: loggedInUserSelector(state),
    thread: commentsThreadSelector(state, threadId),
  }),
  (dispatch, { threadId }) => ({
    addComment: (user, text, isPrivate) => dispatch(postComment(user, threadId, text, isPrivate)),
    repostComment: tmpId => dispatch(repostComment(threadId, tmpId)),
    setPrivacy: (id, isPrivate) => dispatch(setPrivacy(threadId, id, isPrivate)),
    loadThreadIfNeeded: () => dispatch(fetchThreadIfNeeded(threadId)),
    refresh: () => dispatch(updateThread(threadId)),
    deleteComment: id => dispatch(deleteComment(threadId, id)),
  })
)(CommentThreadContainer);
