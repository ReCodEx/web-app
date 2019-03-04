import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { defaultMemoize } from 'reselect';

import AvatarContainer from '../../../containers/AvatarContainer/AvatarContainer';
import NotVerified from './NotVerified';
import Icon, { MailIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

import styles from './usersName.less';

const userNameStyle = defaultMemoize((size, large) => ({
  lineHeight: `${size}px`,
  fontSize: large ? size / 2 : 'inherit',
  marginLeft: large ? 10 : 5,
}));

const UsersName = ({
  id,
  fullName,
  avatarUrl,
  name: { firstName },
  size = 20,
  large = false,
  isVerified,
  noLink,
  privateData = null,
  showEmail = null,
  showExternalIdentifiers = false,
  links: { USER_URI_FACTORY },
  currentUserId,
}) => {
  const email = privateData && privateData.email && showEmail && encodeURIComponent(privateData.email);
  const externalIds = privateData && privateData.externalIds;
  return (
    <span className={styles.wrapper}>
      <span className={styles.avatar}>
        <AvatarContainer avatarUrl={avatarUrl} fullName={fullName} firstName={firstName} size={size} />
      </span>
      <span style={userNameStyle(size, large)}>
        {noLink ? <span>{fullName}</span> : <Link to={USER_URI_FACTORY(id)}>{fullName}</Link>}
        {showExternalIdentifiers && externalIds && Object.keys(externalIds).length > 0 && (
          <OverlayTrigger
            placement="right"
            overlay={
              <Popover
                id={id}
                title={<FormattedMessage id="app.userName.externalIds" defaultMessage="External identifiers" />}>
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
              </Popover>
            }>
            <Icon icon={['far', 'id-card']} gapLeft className="text-muted half-opaque" />
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
};

UsersName.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  name: PropTypes.shape({ firstName: PropTypes.string.isRequired }).isRequired,
  avatarUrl: PropTypes.string,
  isVerified: PropTypes.bool.isRequired,
  privateData: PropTypes.object,
  size: PropTypes.number,
  large: PropTypes.bool,
  noLink: PropTypes.bool,
  showEmail: PropTypes.string,
  showExternalIdentifiers: PropTypes.bool,
  currentUserId: PropTypes.string.isRequired,
  links: PropTypes.object,
};

export default withLinks(UsersName);
