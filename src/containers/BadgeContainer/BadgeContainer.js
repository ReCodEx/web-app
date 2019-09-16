import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import UserSwitchingContainer from '../../containers/UserSwitchingContainer';

import Badge, { LoadingBadge, FailedBadge } from '../../components/widgets/Badge';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { loggedInUserSelector, getLoggedInUserEffectiveRole } from '../../redux/selectors/users';
import { accessTokenExpiration } from '../../redux/selectors/auth';
import { logout, restrictEffectiveRole } from '../../redux/modules/auth';

const BadgeContainer = ({ user, effectiveRole, restrictEffectiveRole, expiration, logout, small = false }) => (
  <ResourceRenderer
    loading={<LoadingBadge small={small} />}
    failed={<FailedBadge color="black" small={small} />}
    resource={user}>
    {user => (
      <span>
        <Badge
          user={user}
          effectiveRole={effectiveRole}
          setEffectiveRole={restrictEffectiveRole}
          logout={logout}
          expiration={expiration}
          small={small}
        />
        <UserSwitchingContainer open={true} />
      </span>
    )}
  </ResourceRenderer>
);

BadgeContainer.propTypes = {
  user: PropTypes.object,
  effectiveRole: PropTypes.string,
  expiration: PropTypes.number.isRequired,
  logout: PropTypes.func.isRequired,
  restrictEffectiveRole: PropTypes.func.isRequired,
  small: PropTypes.bool,
  links: PropTypes.object,
};

export default connect(
  state => ({
    user: loggedInUserSelector(state),
    effectiveRole: getLoggedInUserEffectiveRole(state),
    expiration: accessTokenExpiration(state),
  }),
  dispatch => ({
    logout: () => dispatch(logout()),
    restrictEffectiveRole: role => dispatch(restrictEffectiveRole(role)),
  })
)(BadgeContainer);
