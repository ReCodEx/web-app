import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { logout } from '../../redux/modules/auth';

import Badge, { LoadingBadge, FailedBadge } from '../../components/AdminLTE/Badge';
import ResourceRenderer from '../../components/ResourceRenderer';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { accessTokenExpiration } from '../../redux/selectors/auth';

const BadgeContainer = ({
  user,
  expiration,
  logout
}, {
  links: { HOME_URI }
}) => (
  <ResourceRenderer
    loading={<LoadingBadge />}
    failed={<FailedBadge color='black' />}
    resource={user}>
    <Badge logout={() => logout(HOME_URI)} expiration={expiration} />
  </ResourceRenderer>
);

BadgeContainer.propTypes = {
  user: PropTypes.object.isRequired,
  expiration: PropTypes.number.isRequired,
  logout: PropTypes.func.isRequired
};

BadgeContainer.contextTypes = {
  links: PropTypes.object
};

export default connect(
  state => ({
    user: loggedInUserSelector(state),
    expiration: accessTokenExpiration(state)
  }),
  {
    logout
  }
)(BadgeContainer);
