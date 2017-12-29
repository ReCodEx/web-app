import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../icons';

const FailedLoadingSubmissionTableRow = () =>
  <tr>
    <td colSpan={8} className="text-center">
      <WarningIcon />{' '}
      <FormattedMessage
        id="app.submissionsTable.failedLoading"
        defaultMessage="Could not load this submission."
      />
    </td>
  </tr>;

export default FailedLoadingSubmissionTableRow;
