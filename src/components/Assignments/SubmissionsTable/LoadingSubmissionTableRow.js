import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingSubmissionTableRow = () =>
  <tr>
    <td colSpan={8} className="text-center">
      <LoadingIcon gapRight />
      <FormattedMessage
        id="app.submissionsTable.loading"
        defaultMessage="Loading submitted solutions ..."
      />
    </td>
  </tr>;

export default LoadingSubmissionTableRow;
