import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingAvatar } from '../../Avatar';

const UserPanelLoading = props => (
  <div className="user-panel mt-2 mb-2">
    <div className="float-start me-3">
      <LoadingAvatar {...props} />
    </div>
    <div className="text-light pt-2">
      <p>
        <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
      </p>
    </div>
  </div>
);

export default UserPanelLoading;
