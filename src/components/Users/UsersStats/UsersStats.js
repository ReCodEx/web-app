import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import InfoBox from '../../AdminLTE/InfoBox';

const UsersStats = ({
  id,
  name,
  stats: {
    assignments,
    points,
    hasLimit,
    passesLimit
  }
}) => (
  <InfoBox
    color={!hasLimit ? 'blue' : passesLimit ? 'green' : 'red'}
    icon={!hasLimit ? 'info' : passesLimit ? 'check' : 'exclamation-triangle'}
    title={name}
    value={
      <FormattedNumber value={points.total > 0 ? points.gained / points.total : 0} style="percent" />
    }
    progress={points.total > 0 ? Math.min(1, points.gained / points.total) : 0}
    description={
      <FormattedMessage id="app.usersStats.description" defaultMessage="Points gained from {name}." values={{ name }} />
    } />
);

UsersStats.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  stats: PropTypes.shape({
    assignments: PropTypes.shape({
      total: PropTypes.number.isRequired,
      completed: PropTypes.number.isRequired
    }),
    points: PropTypes.shape({
      total: PropTypes.number.isRequired,
      gained: PropTypes.number.isRequired
    })
  }).isRequired
};

export default UsersStats;
