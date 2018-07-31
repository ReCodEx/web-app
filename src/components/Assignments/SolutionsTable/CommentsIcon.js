import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from '../../icons';

const createIcon = commentsStats => {
  if (commentsStats.authoredCount === 0) {
    return <Icon icon={['far', 'comment']} />;
  }
  if (commentsStats.authoredCount === commentsStats.count) {
    return <Icon icon={['far', 'comment']} flip="horizontal" />;
  }
  return <Icon icon={['far', 'comments']} />;
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
                id="app.solutionsTable.commentsIcon.count"
                defaultMessage="Total Comments: {count}"
                values={{ count: commentsStats.count }}
              />
            </div>
            {commentsStats.last &&
              commentsStats.last.text &&
              <div>
                <FormattedMessage
                  id="app.solutionsTable.commentsIcon.last"
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
