import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const ResultsTableRow = ({ userId, assignmentsIds, submissions }) => {
  var totalPoints = 0;
  return (
    <tr>
      <td>
        <UsersNameContainer userId={userId} />
      </td>
      {assignmentsIds.map(assignmentId => {
        const submission = submissions
          .filter(s => s !== null)
          .filter(s => s.exerciseAssignmentId === assignmentId)[0];
        const points =
          submission &&
          submission !== null &&
          submission.lastSubmission.evaluation &&
          Number.isInteger(submission.lastSubmission.evaluation.points)
            ? submission.lastSubmission.evaluation.points
            : '-';
        const bonusPoints =
          submission && submission !== null ? submission.bonusPoints : 0;
        totalPoints += points !== '-' ? points : 0;
        totalPoints += bonusPoints;
        return (
          <td key={assignmentId}>
            {points}
            {bonusPoints > 0 &&
              <span style={{ color: 'green' }}>
                +{bonusPoints}
              </span>}
            {bonusPoints < 0 &&
              <span style={{ color: 'red' }}>
                {bonusPoints}
              </span>}
          </td>
        );
      })}
      <td style={{ textAlign: 'right' }}>
        <b>
          {totalPoints}
        </b>
      </td>
    </tr>
  );
};

ResultsTableRow.propTypes = {
  userId: PropTypes.string.isRequired,
  assignmentsIds: PropTypes.array.isRequired,
  submissions: PropTypes.array.isRequired
};

export default ResultsTableRow;
