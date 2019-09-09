import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../../icons';

import styles from '../Sidebar.less';

const LoadingMenuItem = () => (
  <li>
    <a>
      <LoadingIcon gapRight />
      <span className={styles.menuItem}>
        <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
      </span>
    </a>
  </li>
);

export default LoadingMenuItem;
