import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingAvatar } from '../../Avatar';

const UserPanelLoading = props => (
  <div className="text-center">
    <LoadingAvatar {...props} />
    <span className="text-light ms-3 sidebar-up-hide-collapsed">
      <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
    </span>
  </div>
);

export default UserPanelLoading;
