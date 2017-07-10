import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const ResultsTableRow = ({ userId, assignmentsIds, submissions }) =>
  <tr>
    <td>
      <UsersNameContainer userId={userId} />
    </td>
    {assignmentsIds.map(assignmentId => {
      const submission = submissions[assignmentId][userId];
      const points = submission !== null ? submission.evaluation.points : '-';
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
  submissions: PropTypes.object.isRequired
};

export default ResultsTableRow;
