import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { logout } from '../../redux/modules/auth';

import Badge, { LoadingBadge, FailedBadge } from '../../components/AdminLTE/Badge';
import { isLoading, isReady, hasFailed } from '../../redux/helpers/resourceManager';
import { loggedInUserDataSelector } from '../../redux/selectors/users';

const BadgeContainer = ({
  user,
  logout
}, {
  links: { HOME_URI }
}) =>
  isLoading(user)
    ? <LoadingBadge />
    : hasFailed(user)
      ? <FailedBadge color='black' />
      : <Badge logout={() => logout(HOME_URI)} user={user.toJS()} />;

BadgeContainer.contextTypes = {
  links: PropTypes.object
};

export default connect(
  state => ({
    user: loggedInUserDataSelector(state)
  }),
  dispatch => ({
    logout: (redirectUrl) => {
      dispatch(push(redirectUrl));
      dispatch(logout());
    }
  })
)(BadgeContainer);
