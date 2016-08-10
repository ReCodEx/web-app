import React, { PropTypes } from 'react';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import { isReady, isLoading, hasFailed } from '../../../redux/helpers/resourceManager';
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
      {assignments.filter(isLoading).size === 0 && assignments.size === 0 &&
        <NoAssignmentTableRow />}

      {assignments.filter(isReady).map(assignment =>
        <AssignmentTableRow
          key={assignment}
          item={assignment.get('data').toJS()}
          showGroup={showGroup} />)}

      {assignments.some(isLoading) &&
        <LoadingAssignmentTableRow />}
    </tbody>
  </Table>
);

AssignmentsTable.propTypes = {
  assignments: PropTypes.instanceOf(List).isRequired,
  showGroup: PropTypes.bool
};

export default AssignmentsTable;
