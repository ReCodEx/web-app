import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const StudentsListItem = ({ id, fullName, avatarUrl, stats, renderActions }) => (
  <tr>
    <td>
      <UsersNameContainer userId={id} />
    </td>
    <td width={150}>
      {stats && (
        <ProgressBar
          className="progress-xs"
          now={stats.points.total > 0 ? Math.min(1, stats.points.gained / stats.points.total) * 100 : 0}
          variant={!stats.hasLimit ? 'info' : stats.passesLimit ? 'success' : 'danger'}
        />
      )}
    </td>
    <td>
      {stats && (
        <FormattedMessage
          id="app.studentsList.gainedPointsOfWithoutBreakingSpaces"
          defaultMessage="{gained, number} of {total, number}"
          values={{ ...stats.points }}
        />
      )}
    </td>
    {renderActions && <td>{renderActions(id)}</td>}
  </tr>
);

StudentsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  stats: PropTypes.shape({
    points: PropTypes.shape({
      total: PropTypes.number.isRequired,
      gained: PropTypes.number.isRequired,
    }),
    hasLimit: PropTypes.bool,
    passesLimit: PropTypes.bool,
  }),
  renderActions: PropTypes.func,
};

export default StudentsListItem;
