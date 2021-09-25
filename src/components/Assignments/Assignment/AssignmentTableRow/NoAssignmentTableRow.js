import React from 'react';
import { FormattedMessage } from 'react-intl';

const NoAssignmentTableRow = () => (
  <tr>
    <td className="text-center">
      <FormattedMessage
        id="app.assignmentsTable.noAssignments"
        defaultMessage="This exercise has no assigments in any of the groups you can see."
      />
    </td>
  </tr>
);

export default NoAssignmentTableRow;
