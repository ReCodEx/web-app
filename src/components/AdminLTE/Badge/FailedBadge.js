import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FailedAvatar } from '../Avatar';

const FailedBadge = (props) => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <FailedAvatar {...props} />
    </div>
    <div className='pull-left info'>
      <p><FormattedMessage id='app.badge.failedLoading' defaultMessage='Failed to load the data' /></p>
      <p>
        <FormattedMessage id='app.badge.failedLoadingInfo' defaultMessage='Please check your Internet connection.' />
      </p>
    </div>
  </div>
);

export default FailedBadge;
