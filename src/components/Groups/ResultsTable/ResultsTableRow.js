import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

const ResultsTableRow = (user, assignmentsIds, getPoints) => (
  <tr>
    <td className="text-center">{user.fullName}</td>
    {assignmentsIds.map(assignment => (
      <td key={assignment}>{getPoints(assignment, user.id)}</td>
    ))}
  </tr>
);

ResultsTableRow.propTypes = {
  user: ImmutablePropTypes.map.isRequired,
  assignmentsIds: PropTypes.array.isRequired,
  getPoints: PropTypes.func.isRequired
};

export default ResultsTableRow;
