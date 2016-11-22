import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { FailedAvatar } from '../../AdminLTE/Avatar';

import styles from './usersName.less';

const FailedUsersName = ({
  size = 25
}) => (
  <div>
    <div className={styles.avatar}>
      <FailedAvatar size={size} />
    </div>
    <div className={styles.name} style={{ lineHeight: `${size}px` }}>
      <FormattedMessage id='app.usersName.loading' defaultMessage='Loading ...' />
    </div>
  </div>
);

FailedUsersName.propTypes = {
  size: PropTypes.number
};

export default FailedUsersName;
