import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const ResultsTableRow = ({ userId, assignmentsIds, getPoints }) => (
  <tr>
    <td><UsersNameContainer userId={userId} /></td>
    {assignmentsIds.map(assignmentId => {
      const submission = getPoints(assignmentId, userId);
      const points = submission !== {} ? submission.evaluation.points : '-';
      return (
        <td key={assignmentId}>
          {points}
        </td>
      );
    })}
  </tr>
);

ResultsTableRow.propTypes = {
  userId: PropTypes.string.isRequired,
  assignmentsIds: PropTypes.array.isRequired,
  getPoints: PropTypes.func.isRequired
};

export default ResultsTableRow;
