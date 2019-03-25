import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';
import { SuccessOrFailureIcon } from '../../icons';
import UsersNameContainer from '../../../containers/UsersNameContainer';

import withLinks from '../../../helpers/withLinks';

const InstancesTable = ({ instances, links: { INSTANCE_URI_FACTORY }, intl }) => (
  <Table hover>
    <thead>
      <tr>
        <th>
          <FormattedMessage id="generic.name" defaultMessage="Name" />
        </th>
        <th>
          <FormattedMessage id="app.instancesTable.admin" defaultMessage="Admin" />
        </th>
        <th>
          <FormattedMessage id="app.instancesTable.validLicence" defaultMessage="Has valid licence" />
        </th>
      </tr>
    </thead>
    <tbody>
      {instances
        .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
        .map(({ id, name, adminId, hasValidLicence }) => (
          <tr key={id}>
            <td>
              <Link to={INSTANCE_URI_FACTORY(id)}>{name}</Link>
            </td>
            <td>
              <UsersNameContainer userId={adminId} />
            </td>
            <td>
              <SuccessOrFailureIcon success={hasValidLicence} />
            </td>
          </tr>
        ))}
    </tbody>
  </Table>
);

InstancesTable.propTypes = {
  instances: PropTypes.array.isRequired,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(withLinks(InstancesTable));
