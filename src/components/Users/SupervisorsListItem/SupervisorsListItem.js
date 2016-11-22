import React, { PropTypes } from 'react';
import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const SupervisorsListItem = ({
  isAdmin,
  id,
  fullName,
  avatarUrl,
  groupId
}) => (
  <tr>
    <td>
      <UsersNameContainer userId={id} />
    </td>
    {isAdmin && (
      <td width={150}>
        <MakeRemoveSupervisorButtonContainer userId={id} groupId={groupId} />
      </td>
    )}
  </tr>
);

SupervisorsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired
};

SupervisorsListItem.contextTypes = {
  links: PropTypes.object
};

export default SupervisorsListItem;
