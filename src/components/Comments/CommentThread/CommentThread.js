import React, { PropTypes } from 'react';

import CommentBox from '../CommentBox';
import AddComment from '../AddComment';
import { UsersComment, SomebodyElsesComment } from '../Comment';

const CommentThread = ({
  comments = [],
  currentUserId,
  addComment
}) => (
  <CommentBox
    commentsCount={comments.length}
    footer={addComment && <AddComment addComment={addComment} />}>
    <div>
      {comments.map((comment, i) =>
        comment.user.id === currentUserId && i % 2 === 0
          ? <UsersComment {...comment} key={comment.id} />
          : <SomebodyElsesComment {...comment} key={comment.id} />)}

      {comments.length === 0 && (
        <p className='text-center'>Zatím zde nejsou žádné komentáře.</p>
      )}
    </div>
  </CommentBox>
);

CommentThread.propTypes = {
  comments: PropTypes.array,
  currentUserId: PropTypes.string.isRequired,
  addComment: PropTypes.func
};

export default CommentThread;

