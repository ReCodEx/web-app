import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import CommentBox from '../CommentBox';
import AddComment from '../AddComment';
import { LoadingIcon } from '../../../Icons';

const LoadingCommentThread = () => (
  <CommentBox
    commentsCount={0}
    footer={<AddComment />}>
    <div>
      <p className='text-center'>
        <LoadingIcon /> <FormattedMessage id='app.comments.loadingCommentThread' defaultMessage='Loading comments ...' />
      </p>
    </div>
  </CommentBox>
);

export default LoadingCommentThread;

