import React from 'react';
import PropTypes from 'prop-types';
import { LoadingIcon } from '../../../icons';
import { FormattedMessage } from 'react-intl';

const LoadingAssignmentTableRow = ({ colSpan = 1 }) => (
  <tr>
    <td className="text-center" colSpan={colSpan}>
      <LoadingIcon gapRight={2} />
      <FormattedMessage id="app.assignmentsTableRow.loading" defaultMessage="Loading assignments..." />
    </td>
  </tr>
);

LoadingAssignmentTableRow.propTypes = {
  colSpan: PropTypes.number,
};

export default LoadingAssignmentTableRow;
