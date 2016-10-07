import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingAvatar } from '../../AdminLTE/Avatar';

const LoadingStudentsListItem = () => (
  <tr>
    <td className='text-center' width={80}>
      <LoadingAvatar light />
    </td>
    <td colSpan={3}>
      <div><FormattedMessage id='app.studentsList.loading' defaultMessage='Loading ...' /></div>
      <small><FormattedMessage id='app.studentsList.loadingDescription' defaultMessage="Not all students' records have been loaded yet." /></small>
    </td>
  </tr>
);

export default LoadingStudentsListItem;
