import React, { PropTypes } from 'react';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import AdminAssignmentsTableRow from './AdminAssignmentsTableRow';
import NoAssignmentsTableRow from './NoAssignmentsTableRow';
import LoadingAssignmentTableRow from './LoadingAssignmentTableRow';
import ResourceRenderer from '../../ResourceRenderer';

const AdminAssignmentsTable = ({
  assignments = []
}) => (
  <Table hover>
    <thead>
      <tr>
        <th></th>
        <th><FormattedMessage id='app.adminAssignments.name' defaultMessage='Assignment name' /></th>
        <th><FormattedMessage id='app.adminAssignments.deadline' defaultMessage='Deadline' /></th>
        <th><FormattedMessage id='app.adminAssignments.secondDeadline' defaultMessage='Second deadline' /></th>
        <th><FormattedMessage id='app.adminAssignments.actions' defaultMessage='Actions' /></th>
      </tr>
    </thead>
    <tbody>
      <ResourceRenderer
        resource={assignments}
        loading={<LoadingAssignmentTableRow />}>
        {assigments =>
          assigments.length === 0
            ? <NoAssignmentsTableRow />
            : assigments.map(assignment => <AdminAssignmentsTableRow key={assignment.id} item={assignment} />)}
      </ResourceRenderer>
    </tbody>
  </Table>
);

AdminAssignmentsTable.propTypes = {
  assignments: PropTypes.instanceOf(List).isRequired,
  showGroup: PropTypes.bool,
  statuses: PropTypes.object
};

export default AdminAssignmentsTable;
