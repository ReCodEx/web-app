import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';
import { MaybeSucceededIcon } from '../../Icons';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const InstancesTable = ({
  instances
}, {
  links: { INSTANCE_URI_FACTORY }
}) => (
  <Table hover>
    <thead>
      <tr>
        <th><FormattedMessage id='app.instancesTable.name' defaultMessage='Name' /></th>
        <th><FormattedMessage id='app.instancesTable.admin' defaultMessage='Admin' /></th>
        <th><FormattedMessage id='app.instancesTable.validLicence' defaultMessage='Has valid licence' /></th>
      </tr>
    </thead>
    <tbody>
      {instances
        .sort((a, b) => a.name < b.name ? -1 : 1)
        .map(({ id, name, admin, hasValidLicence }) => (
          <tr key={id}>
            <td>
              <Link to={INSTANCE_URI_FACTORY(id)}>{name}</Link>
            </td>
            <td>
              <UsersNameContainer userId={admin} />
            </td>
            <td>
              <MaybeSucceededIcon success={hasValidLicence} />
            </td>
          </tr>
        ))}
    </tbody>
  </Table>
);

InstancesTable.propTypes = {
  instances: PropTypes.array.isRequired
};

InstancesTable.contextTypes = {
  links: PropTypes.object
};

export default InstancesTable;
