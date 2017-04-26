import React, { PropTypes } from 'react';
import { LoadingIcon } from '../../../icons';
import { FormattedMessage } from 'react-intl';

const LoadingAssignmentTableRow = (
  {
    showGroup = false
  }
) => (
  <tr>
    <td className="text-center" colSpan={showGroup ? 5 : 4}>
      <LoadingIcon />
      {' '}
      <FormattedMessage
        id="app.assignmentsTableRow.loading"
        defaultMessage="Loading assignments ..."
      />
    </td>
  </tr>
);

LoadingAssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool
};

export default LoadingAssignmentTableRow;
