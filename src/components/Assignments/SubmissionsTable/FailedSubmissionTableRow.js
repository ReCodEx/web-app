import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber, FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';
import Points from './Points';

const FailedSubmissionTableRow = ({
  link,
  note,
  submittedAt,
  maxPoints,
  evaluation: {
    score,
    points,
    bonusPoints
  }
}) => (
  <tr>
    <td><AssignmentStatusIcon id={link} status="failed" /></td>
    <td>
      <FormattedDate value={submittedAt * 1000} />&nbsp;<FormattedTime value={submittedAt * 1000} />
    </td>
    <td className="text-center">
      <span className="text-danger">
        <FormattedNumber style="percent" value={score} />
      </span>
    </td>
    <td className="text-center">
      <span className="text-danger">
        <Points points={points} maxPoints={maxPoints} bonusPoints={bonusPoints} />
      </span>
    </td>
    <td>
      {note}
    </td>
    <td className="text-right">
      <Link to={link} className="btn btn-flat btn-default btn-xs">
        <FormattedMessage id="app.submissionsTable.showDetails" defaultMessage="Show details" />
      </Link>
    </td>
  </tr>
);

FailedSubmissionTableRow.propTypes = {
  link: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  note: PropTypes.string.isRequired,
  maxPoints: PropTypes.number.isRequired,
  evaluation: PropTypes.shape({
    score: PropTypes.number.isRequired,
    points: PropTypes.number.isRequired
  }).isRequired
};

export default FailedSubmissionTableRow;
