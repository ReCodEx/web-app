import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Avatar, { FakeAvatar } from '../../widgets/Avatar';
import NotVerified from './NotVerified';
import { MailIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

import styles from './usersName.less';

const UsersName = ({
  id,
  fullName,
  avatarUrl,
  name: { firstName },
  size = 20,
  large = false,
  isVerified,
  noLink,
  useGravatar,
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
        {useGravatar && avatarUrl !== null
          ? <Avatar size={size} src={avatarUrl} title={fullName} />
          : <FakeAvatar size={size}>
              {firstName[0]}
            </FakeAvatar>}
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
  useGravatar: PropTypes.bool,
  privateData: PropTypes.object,
  size: PropTypes.number,
  large: PropTypes.bool,
  noLink: PropTypes.bool,
  showEmail: PropTypes.string,
  currentUserId: PropTypes.string.isRequired,
  links: PropTypes.object
};

export default withLinks(UsersName);
