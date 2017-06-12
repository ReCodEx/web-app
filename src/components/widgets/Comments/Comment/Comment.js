import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Icon from 'react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router';
import withLinks from '../../../../hoc/withLinks';

import { Posted, Posting, Failed } from './Status';

const Comment = ({
  isFromCurrentUser = false,
  id,
  right,
  status = 'posted',
  user,
  postedAt,
  isPrivate = false,
  text,
  repost,
  isToggling = false,
  togglePrivacy,
  links: { USER_URI_FACTORY }
}) =>
  <div
    className={classNames({
      'direct-chat-success': isPrivate,
      'direct-chat-primary': !isPrivate
    })}
  >
    <div
      className={classNames({
        'direct-chat-msg': true,
        right: right
      })}
    >
      <div className="direct-chat-info clearfix">
        <span
          className={classNames({
            'direct-chat-name': true,
            'pull-right': right
          })}
        >
          <Link to={USER_URI_FACTORY(user.id)}>
            {user.name}
          </Link>
        </span>
        {status === 'posted' && <Posted right={!right} postedAt={postedAt} />}
        {status === 'failed' &&
          <Failed right={!right} repost={() => repost && repost(id)} />}
        {status === 'pending' && <Posting right={!right} />}
      </div>
      <img className="direct-chat-img" src={user.avatarUrl} alt={user.name} />
      <div className="direct-chat-text">
        {isFromCurrentUser &&
          togglePrivacy &&
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip id={id}>
                {isPrivate
                  ? <FormattedMessage
                      id="app.comments.onlyYouCanSeeThisComment"
                      defaultMessage="Only you can see this comment"
                    />
                  : <FormattedMessage
                      id="app.comments.everyoneCanSeeThisComment"
                      defaultMessage="This comment is visible to everyone."
                    />}
              </Tooltip>
            }
          >
            <Icon
              name={
                isToggling
                  ? 'circle-o-notch'
                  : isPrivate ? 'lock' : 'unlock-alt'
              }
              onClick={() => togglePrivacy(id)}
              className="pull-right"
              style={{ cursor: 'pointer' }}
              spin={isToggling}
            />
          </OverlayTrigger>}{' '}
        {text}
      </div>
    </div>
  </div>;

Comment.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  right: PropTypes.bool.isRequired,
  status: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string.isRequired
  }).isRequired,
  postedAt: PropTypes.number,
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  repost: PropTypes.func,
  isPrivate: PropTypes.bool,
  isToggling: PropTypes.bool,
  togglePrivacy: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(Comment);
