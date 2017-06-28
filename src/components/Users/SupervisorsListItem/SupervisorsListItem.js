import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import MakeRemoveSupervisorButtonContainer
  from '../../../containers/MakeRemoveSupervisorButtonContainer';
import MakeGroupAdminButton from '../../Groups/MakeGroupAdminButton';
import { makeAdmin } from '../../../redux/modules/groups';
import { adminsOfGroup } from '../../../redux/selectors/groups';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const SupervisorsListItem = ({
  isAdmin,
  id,
  fullName,
  avatarUrl,
  groupId,
  groupAdmins,
  makeAdmin
}) => (
  <tr>
    <td>
      <UsersNameContainer userId={id} />
    </td>
    {isAdmin &&
      <td>
        <MakeRemoveSupervisorButtonContainer userId={id} groupId={groupId} />
        {groupAdmins.indexOf(id) < 0 &&
          <MakeGroupAdminButton
            onClick={() => makeAdmin(groupId, id)}
            bsSize="xs"
          />}
      </td>}
  </tr>
);

SupervisorsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  groupAdmins: ImmutablePropTypes.list.isRequired,
  makeAdmin: PropTypes.func.isRequired
};

const mapStateToProps = (state, { groupId }) => ({
  groupAdmins: adminsOfGroup(groupId)(state)
});

const mapDispatchToProps = {
  makeAdmin
};

export default connect(mapStateToProps, mapDispatchToProps)(
  SupervisorsListItem
);
