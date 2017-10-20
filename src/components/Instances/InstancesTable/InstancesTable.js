import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';
import { MaybeSucceededIcon } from '../../icons';
import UsersNameContainer from '../../../containers/UsersNameContainer';

import withLinks from '../../../hoc/withLinks';

const InstancesTable = ({ instances, links: { INSTANCE_URI_FACTORY }, intl }) =>
  <Table hover>
    <thead>
      <tr>
        <th>
          <FormattedMessage
            id="app.instancesTable.name"
            defaultMessage="Name"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.instancesTable.admin"
            defaultMessage="Admin"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.instancesTable.validLicence"
            defaultMessage="Has valid licence"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      {instances
        .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
        .map(({ id, name, admin, hasValidLicence }) =>
          <tr key={id}>
            <td>
              <Link to={INSTANCE_URI_FACTORY(id)}>
                {name}
              </Link>
            </td>
            <td>
              <UsersNameContainer userId={admin} />
            </td>
            <td>
              <MaybeSucceededIcon success={hasValidLicence} />
            </td>
          </tr>
        )}
    </tbody>
  </Table>;

InstancesTable.propTypes = {
  instances: PropTypes.array.isRequired,
  links: PropTypes.object,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired
};

export default injectIntl(withLinks(InstancesTable));
