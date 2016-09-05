import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../Icons';

const FailedLoadingSubmissionTableRow = () => (
  <tr>
    <td colSpan={5} className='text-center'>
      <WarningIcon />{' '}<FormattedMessage id='app.submissionsTable.failedLoading' defaultMessage='Could not load this submission.' />
    </td>
  </tr>
);

export default FailedLoadingSubmissionTableRow;
