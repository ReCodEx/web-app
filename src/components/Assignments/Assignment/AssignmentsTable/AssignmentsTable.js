import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import { isReady, isLoading, hasFailed } from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, { NoAssignmentTableRow, LoadingAssignmentTableRow } from '../AssignmentTableRow';

const AssignmentsTable = ({
  assignments = [],
  showGroup = true
}) => (
  <Table hover>
    <thead>
      <tr>
        <th></th>
        <th>Název úlohy</th>
        {showGroup && <th>Skupina</th>}
        <th>Termín odevzdání</th>
        <th>Druhý termín odevzdání</th>
        {/*
        <th>Počet procházejících testů</th>
        <th>Procentuelní úspěšnost</th>
        */}
      </tr>
    </thead>
    <tbody>
      {assignments.filter(isLoading).length === 0 && assignments.length === 0 &&
        <NoAssignmentTableRow />}

      {assignments.filter(isReady).map(assignment =>
        <AssignmentTableRow
          key={assignment}
          item={assignment.data}
          showGroup={showGroup} />)}

      {assignments.some(isLoading) &&
        <LoadingAssignmentTableRow />}
    </tbody>
  </Table>
);

AssignmentsTable.propTypes = {
  assignments: PropTypes.array.isRequired,
  showGroup: PropTypes.bool
};

export default AssignmentsTable;
