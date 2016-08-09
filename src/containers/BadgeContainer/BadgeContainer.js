import React from 'react';
import { connect } from 'react-redux';

import Badge, { LoadingBadge, FailedBadge } from '../../components/Badge';
import { isLoading, isReady, hasFailed } from '../../redux/helpers/resourceManager';
import { loggedInUserSelector } from '../../redux/selectors/users';

const BadgeContainer = ({
  user,
  logout
}) =>
  isLoading(user)
    ? <LoadingBadge />
    : hasFailed(user)
      ? <FailedBadge color='black' />
      : <Badge logout={logout} user={user.data} />;

export default connect(
  state => ({
    user: state.users.getIn([ 'resources', state.auth.userId ]).toJS()
  })
)(BadgeContainer);
