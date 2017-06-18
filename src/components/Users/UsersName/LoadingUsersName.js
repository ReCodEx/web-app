import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { LoadingAvatar } from '../../widgets/Avatar';

import styles from './usersName.less';

const LoadingUsersName = ({ size = 22 }) => (
  <span className={styles.wrapper}>
    <span className={styles.avatar}>
      <LoadingAvatar light size={size} />
    </span>
    <span className={styles.name} style={{ lineHeight: `${size}px` }}>
      <FormattedMessage
        id="app.usersName.loading"
        defaultMessage="Loading ..."
      />
    </span>
  </span>
);

LoadingUsersName.propTypes = {
  size: PropTypes.number
};

export default LoadingUsersName;
