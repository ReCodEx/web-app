import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { logout } from '../../redux/modules/auth';

import Badge, {
  LoadingBadge,
  FailedBadge
} from '../../components/AdminLTE/Badge';
import ResourceRenderer from '../../components/ResourceRenderer';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { accessTokenExpiration } from '../../redux/selectors/auth';

import withLinks from '../../hoc/withLinks';

const BadgeContainer = (
  {
    user,
    expiration,
    logout,
    small = false,
    links: { HOME_URI }
  }
) => (
  <ResourceRenderer
    loading={<LoadingBadge small={small} />}
    failed={<FailedBadge color="black" small={small} />}
    resource={user}
  >
    {data => (
      <Badge
        {...data}
        logout={() => logout(HOME_URI)}
        expiration={expiration}
        small={small}
      />
    )}
  </ResourceRenderer>
);

BadgeContainer.propTypes = {
  user: PropTypes.object,
  expiration: PropTypes.number.isRequired,
  logout: PropTypes.func.isRequired,
  small: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(
  connect(
    state => ({
      user: loggedInUserSelector(state),
      expiration: accessTokenExpiration(state)
    }),
    { logout }
  )(BadgeContainer)
);
