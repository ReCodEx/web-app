import React from 'react';
import { FormattedMessage } from 'react-intl';

import CommentBox from '../CommentBox';
import AddComment from '../AddComment';
import { WarningIcon } from '../../../icons';

const LoadingCommentThread = () => (
  <CommentBox commentsCount={0} footer={<AddComment />}>
    <div>
      <p className="text-center">
        <WarningIcon gapRight={2} />
        <FormattedMessage id="app.comments.loadingCommentThread" defaultMessage="Loading comments..." />
      </p>
    </div>
  </CommentBox>
);

export default LoadingCommentThread;
