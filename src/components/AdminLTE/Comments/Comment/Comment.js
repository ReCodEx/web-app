import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Icon from 'react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router';

import { USER_URI_FACTORY } from '../../../../links';
import { Posted, Posting, Failed } from './Status';

const Comment = ({
  id,
  right,
  status = 'posted',
  user,
  postedAt,
  isPrivate = false,
  text,
  repost
}) => (
  <div className={classNames({
    'direct-chat-success': isPrivate,
    'direct-chat-primary': !isPrivate
  })}>
    <div className={classNames({
      'direct-chat-msg': true,
      'right': right
    })}>
      <div className='direct-chat-info clearfix'>
        <span className={classNames({
          'direct-chat-name': true,
          'pull-right': right
        })}>
          <Link to={USER_URI_FACTORY(user.id)}>
            {user.name}
          </Link>
        </span>
        {status === 'posted' && <Posted right={!right} postedAt={postedAt} />}
        {status === 'failed' && <Failed right={!right} repost={() => repost && repost(id)} />}
        {status === 'pending' && <Posting right={!right} />}
      </div>
      <img className='direct-chat-img' src={user.avatarUrl} alt={user.name} />
      <div className='direct-chat-text'>
        {isPrivate &&
          <OverlayTrigger placement='left' overlay={(
            <Tooltip id={id}>
              <FormattedMessage id='app.comments.onlyYouCanSeeThisComment' defaultMessage='Only you can see this comment' />
            </Tooltip>
          )}>
            <Icon name='lock' className='pull-right' />
          </OverlayTrigger>}{' '}
        {text}
      </div>
    </div>
  </div>
);

Comment.propTypes = {
  right: PropTypes.bool.isRequired,
  status: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string.isRequired
  }).isRequired,
  postedAt: PropTypes.number,
  text: PropTypes.string.isRequired,
  repost: PropTypes.func
};

export default Comment;
