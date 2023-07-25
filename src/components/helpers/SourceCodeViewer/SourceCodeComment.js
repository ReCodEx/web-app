import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import Confirm from '../../forms/Confirm';
import DateTime from '../../widgets/DateTime';
import Markdown from '../../widgets/Markdown';
import Icon, { DeleteIcon, EditIcon, LoadingIcon, WarningIcon } from '../../icons';

import './SourceCodeViewer.css';

const SourceCodeComment = ({
  comment,
  authorView = false,
  startEditting = null,
  removeComment = null,
  restrictCommentAuthor = null,
}) => {
  return (
    <div className={classnames({ issue: comment.issue, 'half-opaque': comment.removing })}>
      <span className="icon">
        {comment.issue ? (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id={`issue-${comment.id}`}>
                {authorView ? (
                  <FormattedMessage
                    id="app.sourceCodeViewer.issueTooltipForAuthor"
                    defaultMessage="This comment is marked as an issue, which means you are expected to fix it in your next submission."
                  />
                ) : (
                  <FormattedMessage
                    id="app.sourceCodeViewer.issueTooltip"
                    defaultMessage="This comment is marked as an issue, which means the author is expected to fix it in the next submission."
                  />
                )}
              </Tooltip>
            }>
            <WarningIcon className="text-danger" gapRight />
          </OverlayTrigger>
        ) : (
          <Icon icon={['far', 'comment']} className="almost-transparent" gapRight />
        )}
      </span>

      <small>
        <UsersNameContainer userId={comment.author} showEmail="icon" />
        <span className="actions">
          {comment.removing && <LoadingIcon />}

          {startEditting &&
            !comment.removing &&
            (!restrictCommentAuthor || restrictCommentAuthor === comment.author) && (
              <EditIcon className="text-warning" gapRight onClick={() => startEditting(comment)} />
            )}
          {removeComment && !comment.removing && (!restrictCommentAuthor || restrictCommentAuthor === comment.author) && (
            <Confirm
              id={`delcfrm-${comment.id}`}
              onConfirmed={() => removeComment(comment.id)}
              question={
                <FormattedMessage
                  id="app.sourceCodeViewer.deleteCommentConfirm"
                  defaultMessage="Do you really wish to remove this comment? This operation cannot be undone."
                />
              }>
              <DeleteIcon className="text-danger" gapRight />
            </Confirm>
          )}
        </span>
      </small>

      <small className="float-right mr-2">
        <DateTime unixts={comment.createdAt} showRelative />
      </small>
      <Markdown source={comment.text} />
    </div>
  );
};

SourceCodeComment.propTypes = {
  comment: PropTypes.object.isRequired,
  startEditting: PropTypes.func,
  removeComment: PropTypes.func,
  authorView: PropTypes.bool,
  restrictCommentAuthor: PropTypes.string,
};

export default SourceCodeComment;
