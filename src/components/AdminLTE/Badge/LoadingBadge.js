import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingAvatar } from '../Avatar';

const LoadingBadge = () => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <LoadingAvatar />
    </div>
    <div className='pull-left info'>
      <p>
        <a>
          <FormattedMessage id='app.badge.loading' defaultMessage='Loading ...' />
        </a>
      </p>
      <a></a>
    </div>
  </div>
);

export default LoadingBadge;
