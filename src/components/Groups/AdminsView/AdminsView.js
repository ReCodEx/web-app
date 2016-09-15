import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import GroupTree from '../GroupTree';
import Box from '../../AdminLTE/Box';
import AddSupervisor from '../AddSupervisor';
import SupervisorsList from '../../Users/SupervisorsList';
import CreateGroupForm from '../../Forms/CreateGroupForm'; // @todo replace with it's' container
import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';

const AdminsView = ({
  group,
  groups,
  addSubgroup,
  supervisors
}) => (
  <Row>
    <Col sm={6}>
      {group.childGroups.length > 0 && (
        <Box title={<FormattedMessage id='app.instance.groupsTitle' defaultMessage='Groups hierarchy' />}>
          <GroupTree
            id={group.id}
            isMemberOf={() => true}
            groups={groups} />
        </Box>)}
      <CreateGroupForm
        title={<FormattedMessage id='app.group.adminsView.addSubgroup' defaultMessage='Add subgroup' />}
        onSubmit={addSubgroup}
        instanceId={group.instanceId}
        parentGroupId={group.id} />
    </Col>
    <Col sm={6}>
      <Box
        title={<FormattedMessage id='app.groupDetail.supervisors' defaultMessage='Supervisors' />}
        collapsable
        isOpen>
        <SupervisorsList users={supervisors} fill isAdmin={true} groupId={group.id} />
      </Box>
      <Box
        title={<FormattedMessage id='app.group.adminsView.addSupervisor' defaultMessage='Add supervisor' />}>
        <AddSupervisor instanceId={group.instanceId} groupId={group.id} />
      </Box>
    </Col>
  </Row>
);

AdminsView.propTypes = {
  group: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired,
  addSubgroup: PropTypes.func.isRequired,
  supervisors: ImmutablePropTypes.list
};

export default AdminsView;
