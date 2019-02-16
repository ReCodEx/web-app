import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';
import MakeGroupAdminButton from '../../Groups/MakeGroupAdminButton';
import RemoveGroupAdminButton from '../../Groups/RemoveGroupAdminButton';
import { addAdmin, removeAdmin } from '../../../redux/modules/groups';
import { adminsOfGroup } from '../../../redux/selectors/groups';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const SupervisorsListItem = ({
  isAdmin,
  id,
  fullName,
  avatarUrl,
  groupId,
  addAdmin,
  removeAdmin,
  primaryAdminsIds,
}) => (
  <tr>
    <td>
      <UsersNameContainer userId={id} />
    </td>
    {isAdmin && (
      <td className="text-right text-nowrap">
        {primaryAdminsIds.indexOf(id) < 0 && (
          <div>
            <MakeRemoveSupervisorButtonContainer userId={id} groupId={groupId} />
            <MakeGroupAdminButton onClick={() => addAdmin(groupId, id)} bsSize="xs" />
          </div>
        )}
        {primaryAdminsIds.indexOf(id) >= 0 && (
          <RemoveGroupAdminButton onClick={() => removeAdmin(groupId, id)} bsSize="xs" />
        )}
      </td>
    )}
  </tr>
);

SupervisorsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  addAdmin: PropTypes.func.isRequired,
  removeAdmin: PropTypes.func.isRequired,
  primaryAdminsIds: PropTypes.array.isRequired,
};

const mapStateToProps = (state, { groupId }) => ({
  groupAdmins: adminsOfGroup(groupId)(state),
});

const mapDispatchToProps = {
  addAdmin,
  removeAdmin,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SupervisorsListItem);
