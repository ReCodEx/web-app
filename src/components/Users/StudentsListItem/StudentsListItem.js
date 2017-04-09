import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const StudentsListItem = ({
  id,
  fullName,
  avatarUrl,
  stats,
  renderActions
}) => (
  <tr>
    <td>
      <UsersNameContainer userId={id} />
    </td>
    <td width={150}>
      {stats && (
        <ProgressBar
          className="progress-xs"
          now={stats.points.total > 0 ? Math.min(1, stats.points.gained / stats.points.total) * 100 : 0}
          bsStyle={!stats.hasLimit ? 'info' : stats.passesLimit ? 'success' : 'danger'} />
      )}
    </td>
    <td>
      {stats && (
        <FormattedMessage
          id="app.studentsList.gainedPointsOf"
          defaultMessage="{gained, number} of {total, number}"
          values={{ ...stats.points }} />
      )}
    </td>
    {renderActions && (
      <td>{renderActions(id)}</td>
    )}
  </tr>
);

StudentsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  stats: PropTypes.shape({
    assignments: PropTypes.shape({
      total: PropTypes.number.isRequired,
      completed: PropTypes.number.isRequired
    }),
    points: PropTypes.shape({
      total: PropTypes.number.isRequired,
      gained: PropTypes.number.isRequired
    })
  }),
  renderActions: PropTypes.func
};

export default StudentsListItem;
