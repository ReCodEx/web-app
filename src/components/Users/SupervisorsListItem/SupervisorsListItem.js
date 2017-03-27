import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';
import MakeGroupAdminButton from '../../Groups/MakeGroupAdminButton';
import { makeAdmin } from '../../../redux/modules/groups';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const SupervisorsListItem = ({
  isAdmin,
  id,
  fullName,
  avatarUrl,
  groupId,
  makeAdmin
}) => (
  <tr>
    <td>
      <UsersNameContainer userId={id} />
    </td>
    {isAdmin && (
      <td width={300}>
        <MakeRemoveSupervisorButtonContainer userId={id} groupId={groupId} />
        <MakeGroupAdminButton onClick={() => makeAdmin(groupId, id)} bsSize='xs' />
      </td>
    )}
  </tr>
);

SupervisorsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  makeAdmin: PropTypes.func.isRequired
};

SupervisorsListItem.contextTypes = {
  links: PropTypes.object
};

const mapDispatchToProps = { makeAdmin };

export default connect(undefined, mapDispatchToProps)(SupervisorsListItem);
