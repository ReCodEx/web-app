import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../../icons';

import '../Sidebar.css';

const LoadingMenuItem = () => (
  <li className="nav-item">
    <a className="nav-link">
      <LoadingIcon gapRight={2} className="nav-icon" />
      <p className="sidebarMenuItem">
        <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
      </p>
    </a>
  </li>
);

export default LoadingMenuItem;
