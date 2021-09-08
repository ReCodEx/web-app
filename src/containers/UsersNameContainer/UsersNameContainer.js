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
  componentDidMount = () => this.props.loadUserIfNeeded(this.props.userId);

  componentDidUpdate(prevProps) {
    if (this.props.userId !== prevProps.userId) {
      this.props.loadUserIfNeeded(this.props.userId);
    }
  }

  render() {
    const {
      user,
      large = false,
      noLink = false,
      noAvatar = false,
      currentUser,
      isSimple = false,
      showEmail = null,
      showExternalIdentifiers = false,
      showRoleIcon = false,
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
              noAvatar={noAvatar}
              large={large}
              size={size}
              noLink={noLink}
              currentUserId={currentUser.id}
              showEmail={showEmail}
              showExternalIdentifiers={showExternalIdentifiers}
              showRoleIcon={showRoleIcon}
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
  noAvatar: PropTypes.bool,
  isSimple: PropTypes.bool,
  showEmail: PropTypes.string,
  showExternalIdentifiers: PropTypes.bool,
  showRoleIcon: PropTypes.bool,
  loadUserIfNeeded: PropTypes.func.isRequired,
};

export default connect(
  (state, { userId }) => ({
    user: getUser(userId)(state),
    currentUser: loggedInUserSelector(state),
  }),
  dispatch => ({
    loadUserIfNeeded: userId => dispatch(fetchUserIfNeeded(userId)),
  })
)(UsersNameContainer);
