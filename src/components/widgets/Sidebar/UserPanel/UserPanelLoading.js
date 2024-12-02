import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingAvatar } from '../../Avatar';

const UserPanelLoading = props => (
  <>
    <div className="float-start me-3">
      <LoadingAvatar {...props} />
    </div>
    <div className="text-light pt-2 sidebar-up-hide-collapsed">
      <p>
        <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
      </p>
    </div>
  </>
);

export default UserPanelLoading;
