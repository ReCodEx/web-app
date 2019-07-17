import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { loggedInUserIdSelector, selectedInstanceId, accessTokenSelector } from '../../redux/selectors/auth';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser, fetchUserStatus } from '../../redux/selectors/users';
import { isTokenValid, isTokenInNeedOfRefreshment } from '../../redux/helpers/token';
import { fetchUsersInstancesIfNeeded } from '../../redux/modules/instances';
import { fetchManyUserInstancesStatus } from '../../redux/selectors/instances';
import { fetchAllGroups } from '../../redux/modules/groups';
import { fetchManyGroupsStatus } from '../../redux/selectors/groups';
import { fetchAllUserMessages } from '../../redux/modules/systemMessages';
import { logout, refresh, selectInstance } from '../../redux/modules/auth';
import { getJsData, resourceStatus } from '../../redux/helpers/resourceManager';

import { library } from '@fortawesome/fontawesome-svg-core';
import { far as regularIcons } from '@fortawesome/free-regular-svg-icons';
import { fas as solidIcons } from '@fortawesome/free-solid-svg-icons';
import { fab as brandIcons } from '@fortawesome/free-brands-svg-icons';

import { LoadingIcon } from '../../components/icons';

import './recodex.css';

library.add(regularIcons, solidIcons, brandIcons);

const customLoadGroups = routes => routes.filter(route => route.customLoadGroups).length > 0;

const someStatusesFailed = (...statuses) =>
  statuses.includes(resourceStatus.FAILED) && !statuses.includes(resourceStatus.PENDING);

class App extends Component {
  static loadAsync = (params, dispatch, { userId, routes }) =>
    userId
      ? Promise.all([
          dispatch((dispatch, getState) =>
            dispatch(fetchUserIfNeeded(userId)).then(() => {
              const state = getState();
              if (!selectedInstanceId(state)) {
                const user = getJsData(getUser(userId)(state));
                dispatch(selectInstance(user.privateData.instancesIds[0]));
              }
              return !customLoadGroups(routes) ? dispatch(fetchAllGroups()) : Promise.resolve();
            })
          ),
          dispatch(fetchUsersInstancesIfNeeded(userId)),
          dispatch(fetchAllUserMessages),
        ])
      : Promise.resolve();

  componentDidMount() {
    this.props.loadAsync(this.props.userId, this.props.routes);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.userId !== prevProps.userId ||
      (customLoadGroups(prevProps.routes) && !customLoadGroups(this.props.routes)) ||
      someStatusesFailed(
        this.props.fetchUserStatus,
        this.props.fetchManyGroupsStatus,
        this.props.fetchManyUserInstancesStatus
      )
    ) {
      this.props.loadAsync(this.props.userId, this.props.routes);
    }
  }

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
        refreshToken()
          .catch(() => logout())
          .then(() => {
            this.isRefreshingToken = false;
          });
      }
    }
  };

  render() {
    const { userId, instanceId } = this.props;
    return userId && !instanceId ? (
      <div
        style={{
          textAlign: 'center',
          height: '100vh',
          lineHeight: '100vh',
        }}>
        <LoadingIcon size="3x" />
      </div>
    ) : (
      this.props.children
    );
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
  routes: PropTypes.array,
  loadAsync: PropTypes.func,
  fetchUserStatus: PropTypes.string,
  fetchManyGroupsStatus: PropTypes.string,
  fetchManyUserInstancesStatus: PropTypes.string,
};

export default connect(
  state => {
    const userId = loggedInUserIdSelector(state);
    return {
      accessToken: accessTokenSelector(state),
      userId,
      instanceId: selectedInstanceId(state),
      isLoggedIn: Boolean(userId),
      fetchUserStatus: fetchUserStatus(state, userId),
      fetchManyGroupsStatus: fetchManyGroupsStatus(state),
      fetchManyUserInstancesStatus: fetchManyUserInstancesStatus(state, userId),
    };
  },
  dispatch => ({
    loadAsync: (userId, routes) => App.loadAsync({}, dispatch, { userId, routes }),
    refreshToken: () => dispatch(refresh()),
    logout: () => dispatch(logout('/')),
  })
)(App);
