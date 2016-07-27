import React from 'react';
import { connect } from 'react-redux';

import Badge from '../../components/Badge';
import FakeBadge from '../../components/FakeBadge';
import { loggedInUserSelector } from '../../redux/selectors/users';

const BadgeContainer = ({
  user: {
    isFetching = true,
    data
  },
  logout
}) =>
  isFetching
    ? <FakeBadge />
    : <Badge logout={logout} user={data} />;

export default connect(
  state => ({
    user: state.users.get(state.auth.userId)
  })
)(BadgeContainer);
