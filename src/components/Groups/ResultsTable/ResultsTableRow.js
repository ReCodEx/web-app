import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const ResultsTableRow = ({
  userId,
  assignmentsIds,
  userStats,
  isAdmin,
  renderActions
}) => {
  return (
    <tr>
      <td>
        <UsersNameContainer userId={userId} />
      </td>
      {assignmentsIds.map(assignmentId => {
        const assignmentData =
          userStats && userStats.assignments
            ? userStats.assignments.find(
                assignment => assignment.id === assignmentId
              )
            : {};
        return (
          <td key={assignmentId}>
            {assignmentData.points &&
            Number.isInteger(assignmentData.points.gained)
              ? assignmentData.points.gained
              : '-'}
            {assignmentData.points &&
              assignmentData.points.bonus > 0 &&
              <span style={{ color: 'green' }}>
                +{assignmentData.points.bonus}
              </span>}
            {assignmentData.points &&
              assignmentData.points.bonus < 0 &&
              <span style={{ color: 'red' }}>
                {assignmentData.points.bonus}
              </span>}
          </td>
        );
      })}
      <td style={{ textAlign: 'right' }}>
        <b>
          {userStats && userStats.points ? userStats.points.gained : '-'}/{userStats && userStats.points ? userStats.points.total : '-'}
        </b>
      </td>
      {isAdmin &&
        <td className="text-right">
          {renderActions && renderActions(userId)}
        </td>}
    </tr>
  );
};

ResultsTableRow.propTypes = {
  userId: PropTypes.string.isRequired,
  assignmentsIds: PropTypes.array.isRequired,
  userStats: PropTypes.object,
  isAdmin: PropTypes.bool,
  renderActions: PropTypes.func
};

export default ResultsTableRow;
