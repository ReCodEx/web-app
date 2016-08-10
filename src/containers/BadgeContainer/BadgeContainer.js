import React from 'react';
import { connect } from 'react-redux';

import Badge, { LoadingBadge, FailedBadge } from '../../components/AdminLTE/Badge';
import { isLoading, isReady, hasFailed } from '../../redux/helpers/resourceManager';
import { loggedInUserDataSelector } from '../../redux/selectors/users';

const BadgeContainer = ({
  user,
  logout
}) =>
  isLoading(user)
    ? <LoadingBadge />
    : hasFailed(user)
      ? <FailedBadge color='black' />
      : <Badge logout={logout} user={user.toJS()} />;

export default connect(
  state => ({
    user: loggedInUserDataSelector(state)
  })
)(BadgeContainer);
