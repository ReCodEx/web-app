import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';

import AdminAssignmentsTableRow from './AdminAssignmentsTableRow';
import NoAssignmentsTableRow from './NoAssignmentsTableRow';
import LoadingAssignmentTableRow from './LoadingAssignmentTableRow';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const AdminAssignmentsTable = ({ assignments = List(), intl: { locale } }) =>
  <Table hover>
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage
            id="app.adminAssignments.name"
            defaultMessage="Assignment name"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.adminAssignments.deadline"
            defaultMessage="Deadline"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.adminAssignments.secondDeadline"
            defaultMessage="Second deadline"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.adminAssignments.actions"
            defaultMessage="Actions"
          />
        </th>
      </tr>
    </thead>
    <ResourceRenderer
      resource={assignments.toArray()}
      loading={
        <tbody>
          <LoadingAssignmentTableRow />
        </tbody>
      }
    >
      {(...assignments) =>
        assignments.length === 0
          ? <tbody>
              <NoAssignmentsTableRow />
            </tbody>
          : <tbody>
              {assignments
                .sort((a, b) => a.firstDeadline - b.firstDeadline)
                .map(assignment =>
                  <AdminAssignmentsTableRow
                    key={assignment.id}
                    {...assignment}
                    locale={locale}
                  />
                )}
            </tbody>}
    </ResourceRenderer>
  </Table>;

AdminAssignmentsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  showGroup: PropTypes.bool,
  statuses: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(AdminAssignmentsTable);
