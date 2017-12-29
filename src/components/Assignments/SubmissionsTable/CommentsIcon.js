import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from 'react-fontawesome';

const createIcon = commentsStats => {
  if (commentsStats.authoredCount === 0) {
    return <Icon name="comment-o" />;
  }
  if (commentsStats.authoredCount === commentsStats.count) {
    return <Icon name="comment-o" flip="horizontal" />;
  }
  return <Icon name="comments-o" />;
};

const CommentsIcon = ({ id, commentsStats = null }) =>
  <span>
    {Boolean(commentsStats) &&
      commentsStats.count > 0 &&
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={`${id}-comment`}>
            <div>
              <FormattedMessage
                id="app.submissionsTable.commentsIcon.count"
                defaultMessage="Total Comments: {count}"
                values={{ count: commentsStats.count }}
              />
            </div>
            {commentsStats.last &&
              commentsStats.last.text &&
              <div>
                <FormattedMessage
                  id="app.submissionsTable.commentsIcon.last"
                  defaultMessage="Last Comment: {last}"
                  values={{ last: commentsStats.last.text }}
                />
              </div>}
          </Tooltip>
        }
      >
        {createIcon(commentsStats)}
      </OverlayTrigger>}
  </span>;

CommentsIcon.propTypes = {
  id: PropTypes.string.isRequired,
  commentsStats: PropTypes.object
};

export default CommentsIcon;
