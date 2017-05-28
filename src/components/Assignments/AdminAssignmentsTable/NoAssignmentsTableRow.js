import React from 'react';
import { FormattedMessage } from 'react-intl';

const NoAssignmentTableRow = () => (
  <tr>
    <td className="text-center" colSpan={5}>
      <FormattedMessage
        id="app.adminAssignmentsTable.noAssignments"
        defaultMessage="There are no assignments."
      />
    </td>
  </tr>
);

NoAssignmentTableRow.propTypes = {};

export default NoAssignmentTableRow;
