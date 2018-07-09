import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  loggedInUserIdSelector,
  selectedInstanceId,
  accessTokenSelector
} from '../../redux/selectors/auth';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser, getUserSettings } from '../../redux/selectors/users';
import {
  isTokenValid,
  isTokenInNeedOfRefreshment
} from '../../redux/helpers/token';
import { fetchUsersInstancesIfNeeded } from '../../redux/modules/instances';
import { fetchUsersGroupsIfNeeded } from '../../redux/modules/groups';
import { logout, refresh, selectInstance } from '../../redux/modules/auth';
import { getJsData } from '../../redux/helpers/resourceManager';

// import fontawesome from '@fortawesome/fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import regularIcons from '@fortawesome/fontawesome-free-regular';
import solidIcons from '@fortawesome/fontawesome-free-solid';
import brandIcons from '@fortawesome/fontawesome-free-brands';

import { LoadingIcon } from '../../components/icons';

import './recodex.css';

library.add(regularIcons, solidIcons, brandIcons);

class App extends Component {
  static loadAsync = (params, dispatch, { userId }) =>
    userId
      ? Promise.all([
          dispatch((dispatch, getState) =>
            dispatch(fetchUserIfNeeded(userId)).then(() => {
              const state = getState();
              if (!selectedInstanceId(state)) {
                const user = getJsData(getUser(userId)(state));
                dispatch(selectInstance(user.privateData.instancesIds[0]));
              }
            })
          ),
          dispatch(fetchUsersGroupsIfNeeded(userId)),
          dispatch(fetchUsersInstancesIfNeeded(userId))
        ])
      : Promise.resolve();

  componentWillMount() {
    this.props.loadAsync(this.props.userId);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.userId !== newProps.userId) {
      newProps.loadAsync(newProps.userId);
    }
  }

  getChildContext = () => ({
    userSettings: this.props.userSettings
  });

  /**
   * The validation in react-router does not cover all cases - validity of the token
   * must be checked more often.
   */
  checkAuthentication = () => {
    const { isLoggedIn, accessToken, refreshToken, logout } = this.props;
    const token = accessToken ? accessToken.toJS() : null;
    if (isLoggedIn) {
      if (!isTokenValid(token)) {
        logout();
      } else if (isTokenInNeedOfRefreshment(token) && !this.isRefreshingToken) {
        this.isRefreshingToken = true;
        refreshToken().catch(() => logout()).then(() => {
          this.isRefreshingToken = false;
        });
      }
    }
  };

  render() {
    const { userId, instanceId } = this.props;
    return userId && !instanceId
      ? <div
          style={{
            textAlign: 'center',
            height: '100vh',
            lineHeight: '100vh'
          }}
        >
          <LoadingIcon size="3x" />
        </div>
      : this.props.children;
  }
}

App.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  instanceId: PropTypes.string,
  accessToken: PropTypes.object,
  refreshToken: PropTypes.func,
  logout: PropTypes.func,
  children: PropTypes.element,
  loadAsync: PropTypes.func,
  userSettings: PropTypes.object
};

App.childContextTypes = {
  userSettings: PropTypes.object
};

export default connect(
  state => {
    const userId = loggedInUserIdSelector(state);
    return {
      accessToken: accessTokenSelector(state),
      userId,
      instanceId: selectedInstanceId(state),
      isLoggedIn: Boolean(userId),
      userSettings: getUserSettings(userId)(state)
    };
  },
  dispatch => ({
    loadAsync: userId => App.loadAsync({}, dispatch, { userId }),
    refreshToken: () => dispatch(refresh()),
    logout: () => dispatch(logout('/'))
  })
)(App);
