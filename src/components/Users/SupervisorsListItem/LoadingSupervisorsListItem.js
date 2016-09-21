import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import LoadingAvatar from '../../AdminLTE/LoadingAvatar';

const LoadingSupervisorsListItem = ({ isAdmin }) => (
  <tr>
    <td className='text-center' width={80}>
      <LoadingAvatar light />
    </td>
    <td colSpan={isAdmin ? 2 : 1}>
      <div><FormattedMessage id='app.supervisorsList.loading' defaultMessage='Loading ...' /></div>
      <small><FormattedMessage id='app.supervisorsList.loadingDescription' defaultMessage="Not all supervisors' records have been loaded yet." /></small>
    </td>
  </tr>
);

export default LoadingSupervisorsListItem;
