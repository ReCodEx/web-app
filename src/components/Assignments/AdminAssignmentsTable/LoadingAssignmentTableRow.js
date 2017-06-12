import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';

const LoadingAssignmentTableRow = () =>
  <tr>
    <td className="text-center" colSpan={5}>
      <LoadingIcon />
      {' '}
      <FormattedMessage
        id="app.adminAssignmentsTableRow.loading"
        defaultMessage="Loading assignments ..."
      />
    </td>
  </tr>;

LoadingAssignmentTableRow.propTypes = {};

export default LoadingAssignmentTableRow;
