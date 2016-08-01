import React from 'react';
import { connect } from 'react-redux';

import Badge from '../../components/Badge';
import LoadingBadge from '../../components/LoadingBadge';
import FailedBadge from '../../components/FailedBadge';
import { loggedInUserSelector } from '../../redux/selectors/users';

const BadgeContainer = ({
  user: {
    isFetching = true,
    error = false,
    data
  },
  logout
}) =>
  isFetching
    ? <LoadingBadge />
    : (error
      ? <FailedBadge color='black' />
      : <Badge logout={logout} user={data} />);

export default connect(
  state => ({
    user: state.users.get(state.auth.userId)
  })
)(BadgeContainer);
