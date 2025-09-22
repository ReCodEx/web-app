import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchUserIfNeeded } from '../../redux/modules/users.js';
import { getUser, loggedInUserSelector } from '../../redux/selectors/users.js';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersName, { LoadingUsersName, FailedUsersName } from '../../components/Users/UsersName';
import { LoadingIcon, FailureIcon } from '../../components/icons';

import './UsersNameContainer.css';

class UsersNameContainer extends Component {
  componentDidMount() {
    if (this.props.userId && !this.props.noAutoload) {
      this.props.loadUserIfNeeded(this.props.userId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.userId && this.props.userId !== prevProps.userId && !this.props.noAutoload) {
      this.props.loadUserIfNeeded(this.props.userId);
    }
  }

  render() {
    const {
      user,
      large = false,
      link = false,
      noAvatar = false,
      currentUser,
      isSimple = false,
      simpleClassName = '',
      showEmail = null,
      showExternalIdentifiers = false,
      showRoleIcon = false,
      listItem = false,
    } = this.props;
    const size = large ? 45 : 20;
    return (
      <ResourceRenderer
        resource={[user, currentUser]}
        loading={isSimple ? <LoadingIcon /> : <LoadingUsersName size={size} />}
        failed={isSimple ? <FailureIcon /> : <FailedUsersName size={size} />}>
        {(user, currentUser) =>
          isSimple ? (
            <span className={`${simpleClassName} simpleName text-nowrap`}>
              {user.name.firstName} {user.name.lastName}
            </span>
          ) : (
            <UsersName
              {...user}
              noAvatar={noAvatar}
              large={large}
              size={size}
              link={link}
              currentUserId={currentUser.id}
              showEmail={showEmail}
              showExternalIdentifiers={showExternalIdentifiers}
              showRoleIcon={showRoleIcon}
              listItem={listItem}
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
  link: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.bool]),
  noAvatar: PropTypes.bool,
  isSimple: PropTypes.bool,
  simpleClassName: PropTypes.string,
  showEmail: PropTypes.string,
  showExternalIdentifiers: PropTypes.bool,
  showRoleIcon: PropTypes.bool,
  noAutoload: PropTypes.bool,
  loadUserIfNeeded: PropTypes.func.isRequired,
  listItem: PropTypes.bool,
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
