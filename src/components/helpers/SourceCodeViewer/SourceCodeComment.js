import React from 'react';
import PropTypes from 'prop-types';
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
  startEditing = null,
  removeComment = null,
  restrictCommentAuthor = null,
}) => {
  return (
    <div className={classnames({ issue: comment.issue, 'opacity-50': comment.removing })}>
      <span className="icon">
        {comment.issue ? (
          <WarningIcon
            className="text-danger"
            gapRight={2}
            tooltipId={`issue-${comment.id}`}
            tooltipPlacement="bottom"
            tooltip={
              authorView ? (
                <FormattedMessage
                  id="app.sourceCodeViewer.issueTooltipForAuthor"
                  defaultMessage="This comment is marked as an issue, which means you are expected to fix it in your next submission."
                />
              ) : (
                <FormattedMessage
                  id="app.sourceCodeViewer.issueTooltip"
                  defaultMessage="This comment is marked as an issue, which means the author is expected to fix it in the next submission."
                />
              )
            }
          />
        ) : (
          <Icon icon={['far', 'comment']} className="opacity-25" gapRight={2} />
        )}
      </span>

      <small>
        <UsersNameContainer userId={comment.author} showEmail="icon" />
        <span className="actions">
          {comment.removing && <LoadingIcon />}

          {startEditing &&
            !comment.removing &&
            (!restrictCommentAuthor || restrictCommentAuthor === comment.author) && (
              <EditIcon className="text-warning" gapRight={2} onClick={() => startEditing(comment)} />
            )}
          {removeComment &&
            !comment.removing &&
            (!restrictCommentAuthor || restrictCommentAuthor === comment.author) && (
              <Confirm
                id={`delcfrm-${comment.id}`}
                onConfirmed={() => removeComment(comment.id)}
                question={
                  <FormattedMessage
                    id="app.sourceCodeViewer.deleteCommentConfirm"
                    defaultMessage="Do you really wish to remove this comment? This operation cannot be undone."
                  />
                }>
                <DeleteIcon className="text-danger" gapRight={2} />
              </Confirm>
            )}
        </span>
      </small>

      <small className="float-end me-2">
        <DateTime unixTs={comment.createdAt} showRelative />
      </small>
      <Markdown source={comment.text} />
    </div>
  );
};

SourceCodeComment.propTypes = {
  comment: PropTypes.object.isRequired,
  startEditing: PropTypes.func,
  removeComment: PropTypes.func,
  authorView: PropTypes.bool,
  restrictCommentAuthor: PropTypes.string,
};

export default SourceCodeComment;
