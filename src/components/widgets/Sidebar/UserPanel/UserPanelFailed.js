import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FailedAvatar } from '../../Avatar';

const UserPanelFailed = props => (
  <div className="text-center">
    <FailedAvatar {...props} />
    <div className="small ms-2 text-light sidebar-up-hide-collapsed">
      <FormattedMessage id="app.badge.failedLoading" defaultMessage="Failed to load the data" />
      <br />
      <FormattedMessage id="app.badge.failedLoadingInfo" defaultMessage="Please check your Internet connection." />
    </div>
  </div>
);

export default UserPanelFailed;
