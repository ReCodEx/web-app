import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const ResultsTableRow = ({ userId, assignmentsIds, submissions }) =>
  <tr>
    <td>
      <UsersNameContainer userId={userId} />
    </td>
    {assignmentsIds.map(assignmentId => {
      const submission = submissions.filter(
        s => s.exerciseAssignmentId === assignmentId
      )[0];
      const points = submission &&
        submission !== null &&
        submission.evaluation &&
        submission.evaluation !== null
        ? submission.evaluation.points
        : '-';
      const bonusPoints = submission &&
        submission !== null &&
        submission.evaluation &&
        submission.evaluation !== null
        ? submission.evaluation.bonusPoints
        : 0;
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
  </tr>;

ResultsTableRow.propTypes = {
  userId: PropTypes.string.isRequired,
  assignmentsIds: PropTypes.array.isRequired,
  submissions: PropTypes.array.isRequired
};

export default ResultsTableRow;
