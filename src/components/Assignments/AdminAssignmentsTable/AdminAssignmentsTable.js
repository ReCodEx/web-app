import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import AdminAssignmentsTableRow from './AdminAssignmentsTableRow';
import NoAssignmentTableRow from './NoAssignmentsTableRow';
import LoadingAssignmentTableRow from './LoadingAssignmentTableRow';
import { isReady, isLoading, getJsData } from '../../../redux/helpers/resourceManager';

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
      {assignments.filter(isLoading).size === 0 && assignments.size === 0 &&
        <NoAssignmentTableRow />}

      {assignments.filter(isReady).map(getJsData).map(assignment =>
        <AdminAssignmentsTableRow
          key={assignment.id}
          item={assignment} />)}

      {assignments.some(isLoading) &&
        <LoadingAssignmentTableRow />}

    </tbody>
  </Table>
);

AdminAssignmentsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  showGroup: PropTypes.bool,
  statuses: PropTypes.object
};

export default AdminAssignmentsTable;
