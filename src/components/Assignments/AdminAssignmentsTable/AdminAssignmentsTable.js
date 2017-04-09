import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import AdminAssignmentsTableRow from './AdminAssignmentsTableRow';
import NoAssignmentsTableRow from './NoAssignmentsTableRow';
import LoadingAssignmentTableRow from './LoadingAssignmentTableRow';
import ResourceRenderer from '../../ResourceRenderer';

const AdminAssignmentsTable = ({
  assignments = List()
}) => (
  <Table hover>
    <thead>
      <tr>
        <th></th>
        <th><FormattedMessage id="app.adminAssignments.name" defaultMessage="Assignment name" /></th>
        <th><FormattedMessage id="app.adminAssignments.deadline" defaultMessage="Deadline" /></th>
        <th><FormattedMessage id="app.adminAssignments.secondDeadline" defaultMessage="Second deadline" /></th>
        <th><FormattedMessage id="app.adminAssignments.actions" defaultMessage="Actions" /></th>
      </tr>
    </thead>
    <ResourceRenderer
      resource={assignments.toArray()}
      loading={(
        <tbody>
          <LoadingAssignmentTableRow />
        </tbody>
      )}>
      {(...assignments) =>
        assignments.length === 0
          ? <tbody><NoAssignmentsTableRow /></tbody>
          : (
            <tbody>
              {assignments
                .sort((a, b) => a.firstDeadline - b.firstDeadline)
                .map(assignment => <AdminAssignmentsTableRow key={assignment.id} {...assignment} />)}
            </tbody>
          )}
    </ResourceRenderer>
  </Table>
);

AdminAssignmentsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  showGroup: PropTypes.bool,
  statuses: PropTypes.object
};

export default AdminAssignmentsTable;
