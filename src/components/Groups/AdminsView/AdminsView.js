import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Box from '../../widgets/Box';
import AddSupervisor from '../AddSupervisor';
import CreateGroupForm from '../../forms/CreateGroupForm'; // @todo replace with it's' container

const AdminsView = (
  {
    group,
    addSubgroup
  }
) => (
  <div>
    <Row>
      <Col sm={12}>
        <h3>
          <FormattedMessage
            id="app.group.adminsView.title"
            defaultMessage="Administrator controls of {groupName}"
            values={{ groupName: group.name }}
          />
        </h3>
      </Col>
    </Row>
    <Row>
      <Col md={6}>
        <Box
          title={
            <FormattedMessage
              id="app.group.adminsView.addSupervisor"
              defaultMessage="Add supervisor"
            />
          }
        >
          <AddSupervisor instanceId={group.instanceId} groupId={group.id} />
        </Box>
      </Col>
      <Col md={6}>
        <CreateGroupForm
          title={
            <FormattedMessage
              id="app.group.adminsView.addSubgroup"
              defaultMessage="Add subgroup"
            />
          }
          onSubmit={addSubgroup}
          instanceId={group.instanceId}
          initialValues={{ publicStats: true }}
          parentGroupId={group.id}
        />
      </Col>
    </Row>
  </div>
);

AdminsView.propTypes = {
  group: PropTypes.object.isRequired,
  addSubgroup: PropTypes.func.isRequired
};

export default AdminsView;
