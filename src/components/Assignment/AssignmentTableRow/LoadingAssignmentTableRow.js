import React, { PropTypes } from 'react';
import { LoadingIcon } from '../../Icons';

const LoadingAssignmentTableRow = ({
  showGroup = false
}) => (
  <tr>
    <td className='text-center' colSpan={showGroup ? 5 : 4}>
      <LoadingIcon /> Načítám obsah ...
    </td>
  </tr>
);

LoadingAssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool
};

export default LoadingAssignmentTableRow;
