import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedNumber,
  FormattedDate,
  FormattedTime,
  FormattedMessage
} from 'react-intl';
import { Link } from 'react-router';

import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';
import Points from './Points';

const SuccessfulSubmissionTableRow = ({
  link,
  note,
  lastSubmission: { evaluation: { score, points } },
  maxPoints,
  bonusPoints,
  solution: { createdAt },
  accepted
}) =>
  <tr>
    <td>
      <AssignmentStatusIcon id={link} status="done" accepted={accepted} />
    </td>
    <td>
      <FormattedDate value={createdAt * 1000} />
      &nbsp;
      <FormattedTime value={createdAt * 1000} />
    </td>
    <td className="text-center">
      <strong className="text-success">
        <FormattedNumber style="percent" value={score} />
      </strong>
    </td>
    <td className="text-center">
      <strong className="text-success">
        <Points
          points={points}
          bonusPoints={bonusPoints}
          maxPoints={maxPoints}
        />
      </strong>
    </td>
    <td>
      {note}
    </td>
    <td className="text-right">
      <Link to={link} className="btn btn-flat btn-default btn-xs">
        <FormattedMessage
          id="app.submissionsTable.showDetails"
          defaultMessage="Show details"
        />
      </Link>
    </td>
  </tr>;

SuccessfulSubmissionTableRow.propTypes = {
  link: PropTypes.string.isRequired,
  note: PropTypes.string.isRequired,
  maxPoints: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  lastSubmission: PropTypes.shape({
    evaluation: PropTypes.shape({
      score: PropTypes.number.isRequired,
      points: PropTypes.number.isRequired
    })
  }).isRequired,
  solution: PropTypes.shape({
    createdAt: PropTypes.number.isRequired
  }).isRequired,
  accepted: PropTypes.bool
};

export default SuccessfulSubmissionTableRow;
