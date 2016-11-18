import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingAvatar } from '../../AdminLTE/Avatar';

const LoadingUsersName = ({
  size = 25
}) => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <LoadingAvatar light size={size} />
    </div>
    <div className='pull-left info'>
      <p>
        <FormattedMessage id='app.usersName.loading' defaultMessage='Loading ...' />
      </p>
    </div>
  </div>
);

LoadingUsersName.propTypes = {
  size: PropTypes.number
};

export default LoadingUsersName;
