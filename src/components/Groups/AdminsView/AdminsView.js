import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Box from '../../AdminLTE/Box';
import SupervisorsList from '../../Users/SupervisorsList';
import CreateGroupForm from '../../Forms/CreateGroupForm'; // @todo replace with it's' container
import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';

const AdminsView = ({
  group,
  addSubgroup,
  supervisors
}) => (
  <Row>
    <Col sm={4} lg={3}>
      <Box
        title={<FormattedMessage id='app.group.adminsView.addSupervisor' defaultMessage='Add supervisor' />}>
        {/* <AddSupervisorForm /> */}
      </Box>
      <Box
        title={<FormattedMessage id='app.group.adminsView.addSubgroup' defaultMessage='Add subgroup' />}>
        <CreateGroupForm onSubmit={addSubgroup} />
      </Box>
    </Col>
    <Col sm={4} lg={3}>
      <Box
        title={<FormattedMessage id='app.groupDetail.supervisors' defaultMessage='Supervisors' />}
        collapsable
        isOpen>
        <SupervisorsList users={supervisors} fill isAdmin={true} groupId={group.id} />
      </Box>
    </Col>
  </Row>
);

AdminsView.propTypes = {
  group: PropTypes.object.isRequired,
  addSubgroup: PropTypes.func.isRequired,
  supervisors: ImmutablePropTypes.list
};

export default AdminsView;
