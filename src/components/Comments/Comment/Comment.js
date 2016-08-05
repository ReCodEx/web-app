import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import { USER_URI_FACTORY } from '../../../links';
import { Posted, Posting, Failed } from './Status';

const Comment = ({
  right,
  status = 'posted',
  user: { id, name, avatarUrl },
  postedAt,
  text
}) => (
  <div className={classNames({
    'direct-chat-msg': true,
    'right': right
  })}>
    <div className='direct-chat-info clearfix'>
      <span className={classNames({
        'direct-chat-name': true,
        'pull-right': right
      })}>
        <Link to={USER_URI_FACTORY(id)}>
          {name}
        </Link>
      </span>
      {status === 'posted' && <Posted right={!right} postedAt={postedAt} />}
      {status === 'failed' && <Failed right={!right} />}
      {status === 'pending' && <Posting right={!right} />}
    </div>
    <img className='direct-chat-img' src={avatarUrl} alt={name} />
    <div className='direct-chat-text'>
      {text}
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
  text: PropTypes.string.isRequired
};

export default Comment;
