import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingSolutionsTableRow = () =>
  <tr>
    <td colSpan={8} className="text-center">
      <LoadingIcon gapRight />
      <FormattedMessage
        id="app.solutionsTable.loading"
        defaultMessage="Loading submitted solutions ..."
      />
    </td>
  </tr>;

export default LoadingSolutionsTableRow;
