import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FailedAvatar } from '../../Avatar';

const UserPanelFailed = props => (
  <div className="user-panel mt-2 pb-2 mb-2">
    <div className="float-left mr-2">
      <FailedAvatar {...props} />
    </div>
    <div className="small text-light">
      <FormattedMessage id="app.badge.failedLoading" defaultMessage="Failed to load the data" />
      <br />
      <FormattedMessage id="app.badge.failedLoadingInfo" defaultMessage="Please check your Internet connection." />
    </div>
  </div>
);

export default UserPanelFailed;
