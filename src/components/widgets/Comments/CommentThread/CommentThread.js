import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import CommentBox from '../CommentBox';
import AddComment from '../AddComment';
import { UsersComment, SomebodyElsesComment } from '../Comment';
import RefreshButton from '../../../buttons/RefreshButton/RefreshButton';

const CommentThread = ({
  title = <FormattedMessage id="app.comments.title" defaultMessage="Comments and Notes" />,
  additionalPublicSwitchNote = null,
  comments = [],
  currentUserId,
  addComment,
  repostComment,
  setPrivacy,
  refresh,
  deleteComment,
  displayAs = 'box',
}) => (
  <CommentBox
    title={title}
    commentsCount={comments.length}
    footer={
      addComment && <AddComment addComment={addComment} additionalPublicSwitchNote={additionalPublicSwitchNote} />
    }
    displayAs={displayAs}>
    <div>
      {comments.map((comment, i) =>
        comment.user.id === currentUserId ? (
          <UsersComment
            {...comment}
            key={comment.id}
            repost={repostComment}
            setPrivacy={setPrivacy}
            deleteComment={deleteComment}
            additionalPublicSwitchNote={additionalPublicSwitchNote}
          />
        ) : (
          <SomebodyElsesComment {...comment} key={comment.id} />
        )
      )}

      {comments.length === 0 && (
        <p className="text-center">
          <FormattedMessage
            id="app.comments.noCommentsYet"
            defaultMessage="There are no comments in this thread yet."
          />
        </p>
      )}

      <p className="text-center small text-body-secondary">
        <RefreshButton onClick={refresh} variant="outline-primary" size="xs" />
      </p>
    </div>
  </CommentBox>
);

CommentThread.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  additionalPublicSwitchNote: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  comments: PropTypes.array,
  currentUserId: PropTypes.string.isRequired,
  addComment: PropTypes.func,
  repostComment: PropTypes.func,
  setPrivacy: PropTypes.func,
  refresh: PropTypes.func,
  deleteComment: PropTypes.func,
  displayAs: PropTypes.string,
};

export default CommentThread;
