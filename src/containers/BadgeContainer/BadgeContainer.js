import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logout } from '../../redux/modules/auth';

import UserSwitchingContainer from '../../containers/UserSwitchingContainer';

import Badge, { LoadingBadge, FailedBadge } from '../../components/widgets/Badge';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { accessTokenExpiration } from '../../redux/selectors/auth';

import withLinks from '../../helpers/withLinks';

const BadgeContainer = ({ user, expiration, logout, small = false, links: { HOME_URI } }) => (
  <ResourceRenderer
    loading={<LoadingBadge small={small} />}
    failed={<FailedBadge color="black" small={small} />}
    resource={user}>
    {user => (
      <span>
        <Badge {...user} logout={() => logout(HOME_URI)} expiration={expiration} small={small} />
        <UserSwitchingContainer open={true} />
      </span>
    )}
  </ResourceRenderer>
);

BadgeContainer.propTypes = {
  user: PropTypes.object,
  expiration: PropTypes.number.isRequired,
  logout: PropTypes.func.isRequired,
  small: PropTypes.bool,
  links: PropTypes.object,
};

export default withLinks(
  connect(
    state => ({
      user: loggedInUserSelector(state),
      expiration: accessTokenExpiration(state),
    }),
    { logout }
  )(BadgeContainer)
);
