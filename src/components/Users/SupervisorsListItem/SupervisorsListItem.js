import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';
import MakeGroupAdminButton from '../../Groups/MakeGroupAdminButton';
import RemoveGroupAdminButton from '../../Groups/RemoveGroupAdminButton';
import { addAdmin, removeAdmin } from '../../../redux/modules/groups';
import { adminsOfGroup } from '../../../redux/selectors/groups';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import Icon, { UserIcon } from '../../icons';

const SupervisorsListItem = ({
  isAdmin,
  id,
  fullName,
  avatarUrl,
  groupId,
  addAdmin,
  removeAdmin,
  primaryAdminsIds,
}) => {
  const isGroupAdmin = primaryAdminsIds.includes(id);
  return (
    <tr>
      <td className="shrink-col">
        {isGroupAdmin ? <Icon icon="user-secret" gapRight gapLeft /> : <UserIcon gapRight gapLeft />}
      </td>
      <td className="shrink-col text-nowrap">
        <UsersNameContainer userId={id} />
      </td>
      {isAdmin && (
        <td className="text-right">
          {isGroupAdmin ? (
            <RemoveGroupAdminButton onClick={() => removeAdmin(groupId, id)} bsSize="xs" />
          ) : (
            <React.Fragment>
              <MakeRemoveSupervisorButtonContainer userId={id} groupId={groupId} />
              <MakeGroupAdminButton onClick={() => addAdmin(groupId, id)} bsSize="xs" />
            </React.Fragment>
          )}
        </td>
      )}
    </tr>
  );
};

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
