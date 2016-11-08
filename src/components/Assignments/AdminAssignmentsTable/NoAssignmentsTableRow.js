import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const NoAssignmentTableRow = ({
  showGroup = false
}) => (
  <tr>
    <td className='text-center' colSpan={6}>
      <FormattedMessage id='app.adminAssignmentsTable.noAssignments' defaultMessage='There are no assignments.' />
    </td>
  </tr>
);

NoAssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool
};

export default NoAssignmentTableRow;
