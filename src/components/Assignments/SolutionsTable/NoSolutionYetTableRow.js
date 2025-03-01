import React from 'react';
import { FormattedMessage } from 'react-intl';

const NoSolutionYetTableRow = () => (
  <tbody>
    <tr>
      <td colSpan={8} className="text-center text-body-secondary p-3">
        <FormattedMessage id="app.solutionsTable.noSolutionsFound" defaultMessage="No solutions were submitted yet." />
      </td>
    </tr>
  </tbody>
);

export default NoSolutionYetTableRow;
