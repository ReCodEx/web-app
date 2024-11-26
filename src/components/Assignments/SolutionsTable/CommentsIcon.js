import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../../icons';

const getIconType = commentsStats =>
  commentsStats?.authoredCount === 0
    ? { icon: ['far', 'comment'] }
    : commentsStats.authoredCount === commentsStats.count
      ? { icon: ['far', 'comment'], flip: 'horizontal' }
      : { icon: ['far', 'comments'] };

const CommentsIcon = ({ id, commentsStats = null, ...props }) =>
  commentsStats ? (
    <Icon
      {...props}
      {...getIconType(commentsStats)}
      icon={['far', 'comment']}
      flip="horizontal"
      tooltipId={`${id}-comment`}
      tooltip={
        <>
          <div>
            <FormattedMessage
              id="app.solutionsTable.commentsIcon.count"
              defaultMessage="Total Comments: {count}"
              values={{ count: commentsStats?.count }}
            />
          </div>
          {commentsStats && commentsStats.last && commentsStats.last.text && (
            <div>
              <FormattedMessage
                id="app.solutionsTable.commentsIcon.last"
                defaultMessage="Last Comment: {last}"
                values={{ last: commentsStats.last.text }}
              />
            </div>
          )}
        </>
      }
    />
  ) : null;

CommentsIcon.propTypes = {
  id: PropTypes.string.isRequired,
  commentsStats: PropTypes.object,
};

export default CommentsIcon;
