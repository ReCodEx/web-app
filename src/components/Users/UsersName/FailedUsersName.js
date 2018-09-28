import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FailedAvatar } from '../../widgets/Avatar';

import styles from './usersName.less';

const FailedUsersName = ({ size = 25 }) =>
  <span className={styles.wrapper}>
    <span className={styles.avatar}>
      <FailedAvatar size={size} />
    </span>
    <span className={styles.name} style={{ lineHeight: `${size}px` }}>
      <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
    </span>
  </span>;

FailedUsersName.propTypes = {
  size: PropTypes.number
};

export default FailedUsersName;
