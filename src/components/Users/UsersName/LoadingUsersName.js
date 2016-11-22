import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingAvatar } from '../../AdminLTE/Avatar';

import styles from './usersName.less';

const LoadingUsersName = ({
  size = 22
}) => (
  <div>
    <div className={styles.avatar}>
      <LoadingAvatar light size={size} />
    </div>
    <div className={styles.name} style={{ lineHeight: `${size}px` }}>
      <FormattedMessage id='app.usersName.loading' defaultMessage='Loading ...' />
    </div>
  </div>
);

LoadingUsersName.propTypes = {
  size: PropTypes.number
};

export default LoadingUsersName;
