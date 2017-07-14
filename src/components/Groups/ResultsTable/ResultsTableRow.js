import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const ResultsTableRow = ({ userId, assignmentsIds, submissions }) =>
  <tr>
    <td>
      <UsersNameContainer userId={userId} />
    </td>
    {assignmentsIds.map((assignmentId, i) => {
      const submission = submissions[i];
      const points = submission &&
        submission !== null &&
        submission.evaluation &&
        submission.evaluation !== null
        ? submission.evaluation.points
        : '-';
      return (
        <td key={assignmentId}>
          {points}
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
