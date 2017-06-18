import React from 'react';
import { FormattedMessage } from 'react-intl';

const NoSolutionYetTableRow = () => (
  <tr>
    <td colSpan={5} className="text-center">
      <FormattedMessage
        id="app.submissionsTable.noSolutionsFound"
        defaultMessage="No solutions were submitted yet."
      />
    </td>
  </tr>
);

export default NoSolutionYetTableRow;
