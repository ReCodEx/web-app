import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router';

import withLinks from '../../../../helpers/withLinks';
import Icon, { DeleteIcon } from '../../../icons';

import { Posted, Posting, Failed } from './Status';
import AvatarContainer from '../../../../containers/AvatarContainer/AvatarContainer';

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
  deleteComment,
  links: { USER_URI_FACTORY },
}) => (
  <div
    className={classnames({
      'direct-chat-success': isPrivate,
      'direct-chat-primary': !isPrivate,
    })}>
    <div
      className={classnames({
        'direct-chat-msg': true,
        right: right,
      })}>
      <div className="direct-chat-info clearfix">
        <span
          className={classnames({
            'direct-chat-name': true,
            'pull-right': right,
          })}>
          <Link to={USER_URI_FACTORY(user.id)}>{user.name}</Link>
        </span>
        {status === 'posted' && <Posted right={!right} postedAt={postedAt} />}
        {status === 'failed' && (
          <Failed right={!right} repost={() => repost && repost(id)} />
        )}
        {status === 'pending' && <Posting right={!right} />}
      </div>
      <AvatarContainer
        avatarUrl={user.avatarUrl}
        fullName={user.name}
        firstName={
          (user.firstName && user.firstName.substring(0, 1)) ||
          user.avatarLetter ||
          '?'
        }
        size={40}
        altClassName="direct-chat-img"
      />
      <div className="direct-chat-text">
        {isFromCurrentUser && (
          <DeleteIcon
            gapLeft
            className="pull-right"
            onClick={() => deleteComment(id)}
          />
        )}
        {isFromCurrentUser && togglePrivacy && (
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip id={id}>
                {isPrivate ? (
                  <FormattedMessage
                    id="app.comments.onlyYouCanSeeThisComment"
                    defaultMessage="Only you can see this comment"
                  />
                ) : (
                  <FormattedMessage
                    id="app.comments.everyoneCanSeeThisComment"
                    defaultMessage="This comment is visible to everyone."
                  />
                )}
              </Tooltip>
            }>
            <Icon
              icon={
                isToggling ? 'circle-notch' : isPrivate ? 'lock' : 'unlock-alt'
              }
              onClick={() => togglePrivacy(id)}
              className="pull-right"
              spin={isToggling}
            />
          </OverlayTrigger>
        )}{' '}
        {text.split('\n').map((line, idx) => (
          <div key={idx} style={{ minHeight: '1em' }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  </div>
);

Comment.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  right: PropTypes.bool.isRequired,
  status: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
  }).isRequired,
  postedAt: PropTypes.number,
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  repost: PropTypes.func,
  isPrivate: PropTypes.bool,
  isToggling: PropTypes.bool,
  togglePrivacy: PropTypes.func,
  deleteComment: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(Comment);
