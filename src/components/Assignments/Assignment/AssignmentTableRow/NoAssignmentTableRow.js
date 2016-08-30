import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const NoAssignmentTableRow = ({
  showGroup = false
}) => (
  <tr>
    <td className='text-center' colSpan={showGroup ? 5 : 4}>
      <FormattedMessage id='app.assignmentsTable.noAssignments' id='There are no assignments.' />
    </td>
  </tr>
);

NoAssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool
};

export default NoAssignmentTableRow;
