import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Avatar from '../../AdminLTE/Avatar';

import styles from './usersName.less';

const UsersName = ({
  id,
  fullName,
  avatarUrl,
  size = 25,
  large = false
}, {
  links: { USER_URI_FACTORY }
}) => (
  <span className={styles.wrapper}>
    <span className={styles.avatar}>
      <Avatar size={size} src={avatarUrl} title={fullName} />
    </span>
    <span className={styles.name} style={{
      lineHeight: `${size}px`,
      fontSize: large ? (size / 2) : 'inherit'
    }}>
      <Link to={USER_URI_FACTORY(id)}>
        {fullName}
      </Link>
    </span>
  </span>
);

UsersName.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  size: PropTypes.number,
  large: PropTypes.bool
};

UsersName.contextTypes = {
  links: PropTypes.object
};

export default UsersName;
