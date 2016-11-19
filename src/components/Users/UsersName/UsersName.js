import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Avatar from '../../AdminLTE/Avatar';

import styles from './usersName.less';

const UsersName = ({
  id,
  fullName,
  avatarUrl,
  size = 25
}, {
  links: { USER_URI_FACTORY }
}) => (
  <div>
    <div className={styles.avatar}>
      <Avatar size={size} src={avatarUrl} title={fullName} />
    </div>
    <div className={styles.name} style={{ lineHeight: `${size}px` }}>
      <Link to={USER_URI_FACTORY(id)}>
        {fullName}
      </Link>
    </div>
  </div>
);

UsersName.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  size: PropTypes.number
};

UsersName.contextTypes = {
  links: PropTypes.object
};

export default UsersName;
