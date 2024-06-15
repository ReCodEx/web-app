import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { lruMemoize } from 'reselect';

import AvatarContainer from '../../../containers/AvatarContainer/AvatarContainer';
import { UserRoleIcon } from '../../helpers/usersRoles';
import { UserUIDataContext } from '../../../helpers/contexts';
import NotVerified from './NotVerified';
import Icon, { MailIcon, BanIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

import styles from './usersName.less';

const userNameStyle = lruMemoize((size, large) => ({
  lineHeight: `${size}px`,
  fontSize: large ? size / 2 : 'inherit',
}));

/**
 * Link may be a function (link factory), string (actual link value), or bool (true indicate default link to user page).
 * @returns {String} the actual resolved link
 */
const resolveLink = (link, id, USER_URI_FACTORY) =>
  typeof link === 'function' ? link(id) : link === true ? USER_URI_FACTORY(id) : link;

const assembleName = ({ titlesBeforeName = '', firstName, lastName, titlesAfterName = '' }, lastNameFirst = false) => {
  const fullName = lastNameFirst ? [lastName, ' ', firstName] : [firstName, ' ', lastName];
  if (titlesBeforeName) {
    if (lastNameFirst) {
      fullName.push(', ', titlesBeforeName);
    } else {
      fullName.unshift(titlesBeforeName, ' ');
    }
  }
  if (titlesAfterName) {
    fullName.push(', ', titlesAfterName);
  }
  return fullName.join('');
};

const UsersName = ({
  id,
  avatarUrl,
  name,
  size = null,
  large = false,
  isVerified,
  link = false,
  noAvatar = false,
  privateData = null,
  showEmail = null,
  showExternalIdentifiers = false,
  showRoleIcon = false,
  currentUserId,
  listItem = false,
  links: { USER_URI_FACTORY },
}) => {
  if (size === null) {
    size = large ? 45 : 20;
  }

  const email = privateData && privateData.email && showEmail && encodeURIComponent(privateData.email);
  const externalIds = privateData && privateData.externalIds;

  return (
    <UserUIDataContext.Consumer>
      {({ lastNameFirst = true }) => {
        const fullName = assembleName(name, listItem && lastNameFirst);
        return (
          <span className={styles.wrapper}>
            {(!privateData || privateData.isAllowed) && !noAvatar && (
              <span className={styles.avatar}>
                <AvatarContainer avatarUrl={avatarUrl} fullName={fullName} firstName={name.firstName} size={size} />
              </span>
            )}
            <span style={userNameStyle(size, large)}>
              {privateData && !privateData.isAllowed && (
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id={`ban-${id}`}>
                      <FormattedMessage
                        id="app.userName.userDeactivated"
                        defaultMessage="The user account was deactivated. The user may not sign in."
                      />
                    </Tooltip>
                  }>
                  <BanIcon gapRight />
                </OverlayTrigger>
              )}

              {link ? <Link to={resolveLink(link, id, USER_URI_FACTORY)}>{fullName}</Link> : <span>{fullName}</span>}

              {showRoleIcon && privateData && (
                <UserRoleIcon
                  role={privateData.role}
                  showTooltip
                  tooltipId={'user-role'}
                  gapLeft
                  className="text-muted half-opaque"
                />
              )}

              {showExternalIdentifiers && externalIds && Object.keys(externalIds).length > 0 && (
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Popover id={id}>
                      <Popover.Title>
                        <FormattedMessage id="app.userName.externalIds" defaultMessage="External identifiers" />
                      </Popover.Title>
                      <Popover.Content>
                        <table>
                          <tbody>
                            {Object.keys(externalIds).map(service => (
                              <tr key={service}>
                                <td className="em-padding-right">{service}:</td>
                                <td>
                                  <strong>
                                    {Array.isArray(externalIds[service])
                                      ? externalIds[service].join(', ')
                                      : externalIds[service]}
                                  </strong>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <small className="text-muted">
                          (
                          <FormattedMessage
                            id="app.userName.externalIdsClickInfo"
                            defaultMessage="click to copy the ID(s) to clipboard"
                          />
                          )
                        </small>
                      </Popover.Content>
                    </Popover>
                  }>
                  <CopyToClipboard
                    text={Object.values(externalIds)
                      .map(id => (Array.isArray(id) ? id.join(', ') : id))
                      .join(', ')}>
                    <Icon
                      icon={['far', 'id-card']}
                      gapLeft
                      className="text-muted half-opaque clickable"
                      style={{ '--fa-beat-scale': 1.5, '--fa-animation-duration': '0.3s' }}
                      onClick={ev => {
                        const style = 'fa-beat';
                        const icon = ev.currentTarget;
                        icon.classList.add(style);
                        window.setTimeout(() => icon.classList.remove(style), 300);
                      }}
                    />
                  </CopyToClipboard>
                </OverlayTrigger>
              )}
              {privateData && privateData.email && showEmail === 'icon' && (
                <a href={`mailto:${email}`}>
                  <MailIcon gapLeft />
                </a>
              )}
              {privateData && privateData.email && showEmail === 'full' && (
                <small className="em-padding-left">
                  {'('}
                  <a href={`mailto:${email}`}>{privateData.email}</a>
                  {')'}
                </small>
              )}
              <span className={styles.notVerified}>
                {!isVerified && <NotVerified userId={id} currentUserId={currentUserId} />}
              </span>
            </span>
          </span>
        );
      }}
    </UserUIDataContext.Consumer>
  );
};

UsersName.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.shape({
    titlesBeforeName: PropTypes.string,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    titlesAfterName: PropTypes.string,
  }).isRequired,
  avatarUrl: PropTypes.string,
  isVerified: PropTypes.bool.isRequired,
  privateData: PropTypes.object,
  size: PropTypes.number,
  large: PropTypes.bool,
  link: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.bool]),
  noAvatar: PropTypes.bool,
  showEmail: PropTypes.string,
  showExternalIdentifiers: PropTypes.bool,
  showRoleIcon: PropTypes.bool,
  currentUserId: PropTypes.string.isRequired,
  listItem: PropTypes.bool,
  links: PropTypes.object,
};

export default withLinks(UsersName);
