import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';

const EvaluationFailedTableRow = ({
  link,
  note,
  submittedAt
}) => (
  <tr>
    <td><AssignmentStatusIcon id={link} status="evaluation-failed" /></td>
    <td>
      <FormattedDate value={submittedAt * 1000} />&nbsp;<FormattedTime value={submittedAt * 1000} />
    </td>
    <td className="text-center">
      <span className="text-danger">
        -
      </span>
    </td>
    <td className="text-center">
      <span className="text-danger">
        -
      </span>
    </td>
    <td>
      {note}
    </td>
    <td className="text-right">
      <Link to={link} className="btn btn-flat btn-default btn-xs">
        <FormattedMessage id="app.evaluationTable.showDetails" defaultMessage="Show details" />
      </Link>
    </td>
  </tr>
);

EvaluationFailedTableRow.propTypes = {
  link: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  note: PropTypes.string.isRequired
};

export default EvaluationFailedTableRow;
