import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersName, {
  LoadingUsersName,
  FailedUsersName
} from '../../components/Users/UsersName';
import { LoadingIcon, Failure } from '../../components/icons';

import './UsersNameContainer.css';

class UsersNameContainer extends Component {
  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.userId !== newProps.userId) {
      newProps.loadAsync();
    }
  }

  static loadAsync = ({ userId }, dispatch) => {
    dispatch(fetchUserIfNeeded(userId));
  };

  render() {
    const { user, large, noLink, currentUserId, isSimple = false } = this.props;
    const size = large ? 45 : 22;
    return (
      <ResourceRenderer
        resource={user}
        loading={isSimple ? <LoadingIcon /> : <LoadingUsersName size={size} />}
        failed={isSimple ? <Failure /> : <FailedUsersName size={size} />}
      >
        {user =>
          isSimple
            ? <span className="simpleName text-nowrap">
                {user.name.firstName} {user.name.lastName}
              </span>
            : <UsersName
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
  noLink: PropTypes.bool,
  loadAsync: PropTypes.func.isRequired,
  isSimple: PropTypes.bool
};

export default connect(
  (state, { userId }) => ({
    user: getUser(userId)(state),
    currentUserId: loggedInUserIdSelector(state)
  }),
  (dispatch, { userId }) => ({
    loadProfileIfNeeded: () => dispatch(fetchUserIfNeeded(userId)),
    loadAsync: () => UsersNameContainer.loadAsync({ userId }, dispatch)
  })
)(UsersNameContainer);
