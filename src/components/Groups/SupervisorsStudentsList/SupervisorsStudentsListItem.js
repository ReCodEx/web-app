import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router';
import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';

const SupervisorsStudentsListItem = ({
  id,
  fullName,
  avatarUrl,
  stats,
  groupId
}, {
  links: { USER_URI_FACTORY }
}) => (
  <tr>
    <td className='text-center' width={80}>
      <img src={avatarUrl} className='img-circle' width={45} />
    </td>
    <td>
      <div><strong>{fullName}</strong></div>
      <small><Link to={USER_URI_FACTORY(id)}>{id}</Link></small>
    </td>
    <td width={150}>
      {stats && (
        <ProgressBar
          className='progress-xs'
          now={stats.points.total > 0 ? Math.min(1, stats.points.gained / stats.points.total) * 100 : 0}
          bsStyle={!stats.hasLimit ? 'info' : stats.passesLimit ? 'success' : 'danger'} />
      )}
    </td>
    <td>
      {stats && (
        <FormattedMessage
          id='app.studentsList.gainedPointsOf'
          defaultMessage='{gained, number} of {total, number}'
          values={{ ...stats.points }} />
      )}
    </td>
    <td>
      <LeaveJoinGroupButtonContainer userId={id} groupId={groupId} />
    </td>
  </tr>
);

SupervisorsStudentsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
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
  })
};

SupervisorsStudentsListItem.contextTypes = {
  links: PropTypes.object
};

export default SupervisorsStudentsListItem;
