import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FailedAvatar } from '../../Avatar';

const UserPanelFailed = props => (
  <>
    <div className="float-start me-2">
      <FailedAvatar {...props} />
    </div>
    <div className="small text-light">
      <FormattedMessage id="app.badge.failedLoading" defaultMessage="Failed to load the data" />
      <br />
      <FormattedMessage id="app.badge.failedLoadingInfo" defaultMessage="Please check your Internet connection." />
    </div>
  </>
);

export default UserPanelFailed;
