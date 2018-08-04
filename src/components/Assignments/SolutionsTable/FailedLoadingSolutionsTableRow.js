import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../icons';

const FailedLoadingSolutionsTableRow = () =>
  <tr>
    <td colSpan={8} className="text-center">
      <WarningIcon gapRight />
      <FormattedMessage
        id="app.solutionsTable.failedLoading"
        defaultMessage="Could not load this submission."
      />
    </td>
  </tr>;

export default FailedLoadingSolutionsTableRow;
