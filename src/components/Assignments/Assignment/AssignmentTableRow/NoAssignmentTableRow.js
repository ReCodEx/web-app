import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

const NoAssignmentTableRow = ({ showGroup = false }) => (
  <tr>
    <td className="text-center" colSpan={showGroup ? 5 : 4}>
      <FormattedMessage
        id="app.assignmentsTable.noAssignments"
        defaultMessage="There are no assignments."
      />
    </td>
  </tr>
);

NoAssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool
};

export default NoAssignmentTableRow;
