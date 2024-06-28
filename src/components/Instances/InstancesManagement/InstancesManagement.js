import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Page from '../../layout/Page';
import Box from '../../widgets/Box';
import InstancesTable from '../InstancesTable';

const InstancesManagement = ({ instances }) => (
  <Page
    title={<FormattedMessage id="app.instances.title" defaultMessage="Instances" />}
    description={<FormattedMessage id="app.instances.description" defaultMessage="Management of all instances" />}
    resourceArray={instances}>
    {instances => (
      <Row>
        <Col lg={6}>
          <Box title={<FormattedMessage id="app.instances.listTitle" defaultMessage="List of instances" />} noPadding>
            <InstancesTable instances={instances} />
          </Box>
        </Col>
      </Row>
    )}
  </Page>
);

InstancesManagement.propTypes = {
  instances: ImmutablePropTypes.map,
};

export default InstancesManagement;
