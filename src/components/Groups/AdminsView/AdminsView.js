import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Box from '../../AdminLTE/Box';
import AddSupervisor from '../AddSupervisor';
import SupervisorsList from '../../Users/SupervisorsList';
import CreateGroupForm from '../../Forms/CreateGroupForm'; // @todo replace with it's' container
import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';

const AdminsView = ({
  group,
  addSubgroup,
  supervisors
}) => (
  <Row>
    <Col sm={6}>
      <h3>
        <FormattedMessage
          id='app.group.adminsView.title'
          defaultMessage='Administrator controls of {groupName}'
          values={{ groupName: group.name }} />
      </h3>
      <Box
        title={<FormattedMessage id='app.group.adminsView.supervisors' defaultMessage='Supervisors' />}
        collapsable
        noPadding
        isOpen>
        <SupervisorsList
          users={supervisors.toJS()}
          isLoaded={supervisors.size === group.supervisors.length}
          isAdmin={true}
          groupId={group.id}
          fill />
      </Box>
      <Box
        title={<FormattedMessage id='app.group.adminsView.addSupervisor' defaultMessage='Add supervisor' />}>
        <AddSupervisor instanceId={group.instanceId} groupId={group.id} />
      </Box>
    </Col>
    <Col sm={6}>
      <CreateGroupForm
        title={<FormattedMessage id='app.group.adminsView.addSubgroup' defaultMessage='Add subgroup' />}
        onSubmit={addSubgroup}
        instanceId={group.instanceId}
        parentGroupId={group.id} />
    </Col>
  </Row>
);

AdminsView.propTypes = {
  group: PropTypes.object.isRequired,
  addSubgroup: PropTypes.func.isRequired,
  supervisors: ImmutablePropTypes.list
};

export default AdminsView;
