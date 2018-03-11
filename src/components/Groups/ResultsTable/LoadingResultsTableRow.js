import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingResultsTableRow = () =>
  <tr>
    <td className="text-center" colSpan={5}>
      <LoadingIcon />{' '}
      <FormattedMessage
        id="app.groupResultsTableRow.loading"
        defaultMessage="Loading results ..."
      />
    </td>
  </tr>;

LoadingResultsTableRow.propTypes = {};

export default LoadingResultsTableRow;
