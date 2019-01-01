import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingSolutionsTableRow = (
  <tbody>
    <tr>
      <td colSpan={8} className="text-center em-padding">
        <LoadingIcon gapRight />
        <FormattedMessage
          id="app.solutionsTable.loading"
          defaultMessage="Loading submitted solutions..."
        />
      </td>
    </tr>
  </tbody>
);

export default LoadingSolutionsTableRow;
