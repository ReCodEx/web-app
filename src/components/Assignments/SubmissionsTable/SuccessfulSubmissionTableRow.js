import React, { PropTypes } from 'react';
import { FormattedNumber, FormattedDate, FormattedTime } from 'react-intl';
import { Link } from 'react-router';

import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';
import BonusPoints from './BonusPoints';

const SuccessfulSubmissionTableRow = ({
  link,
  note,
  submittedAt,
  evaluation: {
    score,
    bonusPoints,
    points,
    maxPoints
  }
}) => (
  <tr>
    <td><AssignmentStatusIcon status={'done'} /></td>
    <td>
      <FormattedDate value={submittedAt * 1000} />&nbsp;<FormattedTime value={submittedAt * 1000} />
    </td>
    <td className='text-center'>
      <strong className='text-success'>
        <FormattedNumber style='percent' value={score} />
      </strong>
    </td>
    <td className='text-center'>
      <strong className='text-success'>
        {points + bonusPoints}{'/'}{maxPoints}
      </strong>
      {bonusPoints !== 0 && (
        <span> == {points} <BonusPoints bonus={bonusPoints} /></span>
      )}
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

SuccessfulSubmissionTableRow.propTypes = {
  link: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  note: PropTypes.string.isRequired,
  evaluation: PropTypes.shape({
    score: PropTypes.number.isRequired,
    points: PropTypes.number.isRequired,
    maxPoints: PropTypes.number.isRequired
  }).isRequired
};

export default SuccessfulSubmissionTableRow;
