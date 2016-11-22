import React, { PropTypes } from 'react';
import { LoadingUsersName } from '../../Users/UsersName';

const LoadingSupervisorsListItem = ({ isAdmin }) => (
  <tr>
    <td colSpan={isAdmin ? 2 : 1}>
      <LoadingUsersName />
    </td>
  </tr>
);

LoadingSupervisorsListItem.propTypes = {
  isAdmin: PropTypes.bool
};

export default LoadingSupervisorsListItem;
