import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FailedAvatar } from '../../AdminLTE/Avatar';

const FailedUsersName = ({
  size = 25
}) => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <FailedAvatar size={size} />
    </div>
    <div className='pull-left info'>
      <p>
        <Link to={'#'}>
          <FormattedMessage id='app.usersName.loading' defaultMessage='Loading ...' />
        </Link>
      </p>
    </div>
  </div>
);

export default FailedUsersName;
