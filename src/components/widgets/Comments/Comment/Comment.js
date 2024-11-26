import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

import withLinks from '../../../../helpers/withLinks.js';
import Icon, { DeleteIcon } from '../../../icons';

import { Posted, Posting, Failed } from './Status';
import AvatarContainer from '../../../../containers/AvatarContainer/AvatarContainer.js';

import * as styles from '../comments.less';

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
  isUpdating = false,
  setPrivacy,
  deleteComment,
  additionalPublicSwitchNote = null,
  links: { USER_URI_FACTORY },
}) => (
  <div
    className={classnames({
      'direct-chat-light': isPrivate,
      'direct-chat-primary': !isPrivate,
    })}>
    <div
      className={classnames({
        'direct-chat-msg': true,
        end: right,
      })}>
      <div className="direct-chat-info clearfix">
        <span
          className={classnames({
            'direct-chat-name': true,
            'float-end': right,
          })}>
          <Link to={USER_URI_FACTORY(user.id)}>{user.name}</Link>
        </span>
        {status === 'posted' && <Posted id={id} right={!right} postedAt={postedAt} />}
        {status === 'failed' && <Failed right={!right} repost={() => repost && repost(id)} />}
        {status === 'pending' && <Posting right={!right} />}
      </div>
      <AvatarContainer
        avatarUrl={user.avatarUrl}
        fullName={user.name}
        firstName={(user.firstName && user.firstName.substring(0, 1)) || user.avatarLetter || '?'}
        size={40}
        altClassName="direct-chat-img"
      />
      <div className="direct-chat-text">
        {isFromCurrentUser && (
          <DeleteIcon
            gapLeft={2}
            className={classnames({ 'float-end': true, [styles.iconButton]: true, [styles.iconButtonDelete]: true })}
            onClick={() => deleteComment(id)}
          />
        )}
        {isFromCurrentUser && setPrivacy && (
          <Icon
            icon={isUpdating ? 'circle-notch' : isPrivate ? 'eye-slash' : 'eye'}
            onClick={() => setPrivacy(id, !isPrivate)}
            className={classnames({
              'float-end': true,
              [styles.iconButton]: true,
              [styles.iconButtonLock]: !isPrivate,
              [styles.iconButtonUnlock]: isPrivate,
            })}
            spin={isUpdating}
            tooltipId={id}
            tooltipPlacement="left"
            tooltip={
              isPrivate ? (
                <FormattedMessage
                  id="app.comments.onlyYouCanSeeThisComment"
                  defaultMessage="Only you can see this comment"
                />
              ) : (
                <>
                  <FormattedMessage
                    id="app.comments.everyoneCanSeeThisComment"
                    defaultMessage="This comment is visible to everyone who can see this thread."
                  />
                  {additionalPublicSwitchNote && <> {additionalPublicSwitchNote}</>}
                </>
              )
            }
          />
        )}
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
    firstName: PropTypes.string,
    avatarLetter: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
  postedAt: PropTypes.number,
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  repost: PropTypes.func,
  isPrivate: PropTypes.bool,
  isUpdating: PropTypes.bool,
  setPrivacy: PropTypes.func,
  deleteComment: PropTypes.func,
  additionalPublicSwitchNote: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  links: PropTypes.object,
};

export default withLinks(Comment);
