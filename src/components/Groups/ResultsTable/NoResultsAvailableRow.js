import React from 'react';
import { FormattedMessage } from 'react-intl';

const NoResultsAvailableRow = () =>
  <tr>
    <td className="text-center" colSpan={5}>
      <FormattedMessage
        id="app.groupResultsTableRow.noResults"
        defaultMessage="There are currently no results available."
      />
    </td>
  </tr>;

NoResultsAvailableRow.propTypes = {};

export default NoResultsAvailableRow;
