import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';

import AssignmentTableRow from '../AssignmentTableRow/AssignmentTableRow';

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
        <th>Počet procházejících testů</th>
        <th>Procentuelní úspěšnost</th>
      </tr>
    </thead>
    <tbody>
      {assignments.length === 0 &&
        <tr>
          <td colSpan={showGroup === true ? 4 : 3}>
            Nejsou dostupná žádná data.
          </td>
        </tr>}

      {assignments.map((assignment, key) =>
        <AssignmentTableRow
          key={key}
          item={assignment}
          showGroup={showGroup} />)}
    </tbody>
  </Table>
);

AssignmentsTable.propTypes = {
  assignments: PropTypes.array.isRequired,
  showGroup: PropTypes.bool
};

export default AssignmentsTable;
