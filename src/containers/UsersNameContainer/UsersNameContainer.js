import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser, loggedInUserSelector } from '../../redux/selectors/users';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersName, { LoadingUsersName, FailedUsersName } from '../../components/Users/UsersName';
import { LoadingIcon, FailureIcon } from '../../components/icons';

import './UsersNameContainer.css';

class UsersNameContainer extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.userId !== prevProps.userId) {
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ userId }, dispatch) => {
    dispatch(fetchUserIfNeeded(userId));
  };

  render() {
    const {
      user,
      large,
      noLink,
      currentUser,
      isSimple = false,
      showEmail = null,
      showExternalIdentifiers = false,
    } = this.props;
    const size = large ? 45 : 20;
    return (
      <ResourceRenderer
        resource={[user, currentUser]}
        loading={isSimple ? <LoadingIcon /> : <LoadingUsersName size={size} />}
        failed={isSimple ? <FailureIcon /> : <FailedUsersName size={size} />}>
        {(user, currentUser) =>
          isSimple ? (
            <span className="simpleName text-nowrap">
              {user.name.firstName} {user.name.lastName}
            </span>
          ) : (
            <UsersName
              {...user}
              large={large}
              size={size}
              noLink={noLink}
              currentUserId={currentUser.id}
              showEmail={showEmail}
              showExternalIdentifiers={showExternalIdentifiers}
            />
          )
        }
      </ResourceRenderer>
    );
  }
}

UsersNameContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  large: PropTypes.bool,
  user: ImmutablePropTypes.map,
  noLink: PropTypes.bool,
  loadAsync: PropTypes.func.isRequired,
  isSimple: PropTypes.bool,
  showEmail: PropTypes.string,
  showExternalIdentifiers: PropTypes.bool,
};

export default connect(
  (state, { userId }) => ({
    user: getUser(userId)(state),
    currentUser: loggedInUserSelector(state),
  }),
  (dispatch, { userId }) => ({
    loadProfileIfNeeded: () => dispatch(fetchUserIfNeeded(userId)),
    loadAsync: () => UsersNameContainer.loadAsync({ userId }, dispatch),
  })
)(UsersNameContainer);
