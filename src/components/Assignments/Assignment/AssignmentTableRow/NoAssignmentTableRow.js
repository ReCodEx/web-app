import React, { PropTypes } from 'react';

const NoAssignmentTableRow = ({
  showGroup = false
}) => (
  <tr>
    <td className='text-center' colSpan={showGroup ? 5 : 4}>
      Nebyly dosud zadané žádné úlohy.
    </td>
  </tr>
);

NoAssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool
};

export default NoAssignmentTableRow;
