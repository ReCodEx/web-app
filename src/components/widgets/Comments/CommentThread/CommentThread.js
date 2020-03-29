import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import CommentBox from '../CommentBox';
import AddComment from '../AddComment';
import { UsersComment, SomebodyElsesComment } from '../Comment';

const CommentThread = ({
  title = <FormattedMessage id="app.comments.title" defaultMessage="Comments and Notes" />,
  comments = [],
  currentUserId,
  addComment,
  repostComment,
  togglePrivacy,
  refresh,
  deleteComment,
  inModal = false,
}) => (
  <CommentBox
    title={title}
    commentsCount={comments.length}
    footer={addComment && <AddComment addComment={addComment} refresh={refresh} />}
    inModal={inModal}>
    <div>
      {comments.map((comment, i) =>
        comment.user.id === currentUserId ? (
          <UsersComment
            {...comment}
            key={comment.id}
            repost={repostComment}
            togglePrivacy={togglePrivacy}
            deleteComment={deleteComment}
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
    </div>
  </CommentBox>
);

CommentThread.propTypes = {
  title: PropTypes.oneOfType([PropTypes.oneOf([FormattedMessage]), PropTypes.element, PropTypes.string]),
  comments: PropTypes.array,
  currentUserId: PropTypes.string.isRequired,
  addComment: PropTypes.func,
  repostComment: PropTypes.func,
  togglePrivacy: PropTypes.func,
  refresh: PropTypes.func,
  deleteComment: PropTypes.func,
  inModal: PropTypes.bool,
};

export default CommentThread;
