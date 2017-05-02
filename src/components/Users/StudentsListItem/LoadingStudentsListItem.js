import React from 'react';
import PropTypes from 'prop-types';
import { LoadingUsersName } from '../../Users/UsersName';

const LoadingStudentsListItem = ({ withActions }) => (
  <tr>
    <td colSpan={withActions ? 4 : 3}>
      <LoadingUsersName />
    </td>
  </tr>
);

LoadingStudentsListItem.propTypes = {
  withActions: PropTypes.bool
};

export default LoadingStudentsListItem;
