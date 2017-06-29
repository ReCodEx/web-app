import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchProfileIfNeeded } from '../../redux/modules/publicProfiles';
import { getProfile } from '../../redux/selectors/publicProfiles';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersName, {
  LoadingUsersName,
  FailedUsersName
} from '../../components/Users/UsersName';

class UsersNameContainer extends Component {
  componentWillMount() {
    UsersNameContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.userId !== newProps.userId) {
      UsersNameContainer.loadData(newProps);
    }
  }

  static loadData = ({ loadProfileIfNeeded }) => {
    loadProfileIfNeeded();
  };

  render() {
    const { user, large, noLink, currentUserId } = this.props;
    const size = large ? 45 : 22;
    return (
      <ResourceRenderer
        resource={user}
        loading={<LoadingUsersName size={size} />}
        failed={<FailedUsersName size={size} />}
      >
        {user =>
          <UsersName
            {...user}
            large={large}
            size={size}
            noLink={noLink}
            currentUserId={currentUserId}
          />}
      </ResourceRenderer>
    );
  }
}

UsersNameContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string,
  large: PropTypes.bool,
  user: ImmutablePropTypes.map,
  noLink: PropTypes.bool
};

export default connect(
  (state, { userId }) => ({
    user: getProfile(userId)(state),
    currentUserId: loggedInUserIdSelector(state)
  }),
  (dispatch, { userId }) => ({
    loadProfileIfNeeded: () => dispatch(fetchProfileIfNeeded(userId))
  })
)(UsersNameContainer);
