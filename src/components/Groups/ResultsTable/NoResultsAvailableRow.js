import React from 'react';
import { FormattedMessage } from 'react-intl';

const NoResultsAvailableRow = () =>
  <tr>
    <td className="text-center">
      <FormattedMessage
        id="app.groupResultsTableRow.noStudents"
        defaultMessage="There are currently no students in the group."
      />
    </td>
  </tr>;

NoResultsAvailableRow.propTypes = {};

export default NoResultsAvailableRow;
