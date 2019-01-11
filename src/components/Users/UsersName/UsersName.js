import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import NotVerified from './NotVerified';
import { MailIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

import styles from './usersName.less';
import AvatarContainer from '../../../containers/AvatarContainer/AvatarContainer';

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
  links: { USER_URI_FACTORY },
  currentUserId
}) => {
  const email =
    privateData &&
    privateData.email &&
    showEmail &&
    encodeURIComponent(privateData.email);
  return (
    <span className={styles.wrapper}>
      <span className={styles.avatar}>
        <AvatarContainer
          avatarUrl={avatarUrl}
          fullName={fullName}
          firstName={firstName}
          size={size}
        />
      </span>
      {}
      <span
        style={{
          lineHeight: `${size}px`,
          fontSize: large ? size / 2 : 'inherit',
          marginLeft: large ? 10 : 5
        }}
      >
        {!noLink &&
          <Link to={USER_URI_FACTORY(id)}>
            {fullName}
          </Link>}
        {noLink &&
          <span>
            {fullName}
          </span>}
        {privateData &&
          privateData.email &&
          showEmail === 'icon' &&
          <a href={`mailto:${email}`}>
            <MailIcon gapLeft />
          </a>}
        {privateData &&
          privateData.email &&
          showEmail === 'full' &&
          <small>
            {' ('}
            <a href={`mailto:${email}`}>
              {privateData.email}
            </a>
            {')'}
          </small>}
        <span className={styles.notVerified}>
          {!isVerified &&
            <NotVerified userId={id} currentUserId={currentUserId} />}
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
  currentUserId: PropTypes.string.isRequired,
  links: PropTypes.object
};

export default withLinks(UsersName);
