import React, { PropTypes } from 'react';
import { FormattedNumber, FormattedDate, FormattedTime } from 'react-intl';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';

const FailedSubmissionTableRow = ({
  link,
  note,
  submittedAt,
  evaluation: {
    score,
    points,
    maxPoints
  }
}) => (
  <tr>
    <td><AssignmentStatusIcon status={'failed'} /></td>
    <td>
      <FormattedDate value={submittedAt * 1000} />&nbsp;<FormattedTime value={submittedAt * 1000} />
    </td>
    <td className='text-center'>
      <span className='text-danger'>
        <FormattedNumber style='percent' value={score} />
      </span>
    </td>
    <td className='text-center'>
      <span className='text-danger'>
        {points}{'/'}{maxPoints}
      </span>
    </td>
    <td>
      {note}
    </td>
    <td className='text-right'>
      <Link to={link} className='btn btn-flat btn-default btn-xs'>
        Zobrazit podrobnosti
      </Link>
    </td>
  </tr>
);

FailedSubmissionTableRow.propTypes = {
  link: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  note: PropTypes.string.isRequired,
  evaluation: PropTypes.shape({
    score: PropTypes.number.isRequired,
    points: PropTypes.number.isRequired,
    maxPoints: PropTypes.number.isRequired
  }).isRequired
};

export default FailedSubmissionTableRow;
