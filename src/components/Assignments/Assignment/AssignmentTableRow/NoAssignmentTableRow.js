import React from 'react';
import { FormattedMessage } from 'react-intl';

const NoAssignmentTableRow = () => (
  <tr>
    <td className="text-center">
      <FormattedMessage id="app.assignmentsTable.noAssignments" defaultMessage="There are no assignments." />
    </td>
  </tr>
);

export default NoAssignmentTableRow;
