import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Label, ProgressBar, ListGroupItem, Clearfix } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';

const StudentsListItem = ({
  id,
  fullName,
  avatarUrl,
  stats
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
          bsStyle={!stats.hasLimit ? 'blue' : stats.passesLimit ? 'success' : 'danger'} />
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
  })
};

StudentsListItem.contextTypes = {
  links: PropTypes.object
};

export default StudentsListItem;
