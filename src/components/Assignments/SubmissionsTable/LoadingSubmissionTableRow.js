import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingSubmissionTableRow = () =>
  <tr>
    <td colSpan={5} className="text-center">
      <LoadingIcon />
      {' '}
      <FormattedMessage
        id="app.submissionsTable.loading"
        defaultMessage="Loading submitted solutions ..."
      />
    </td>
  </tr>;

export default LoadingSubmissionTableRow;
