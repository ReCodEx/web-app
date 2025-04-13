import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far as regularIcons } from '@fortawesome/free-regular-svg-icons';
import { fas as solidIcons } from '@fortawesome/free-solid-svg-icons';
import { fab as brandIcons } from '@fortawesome/free-brands-svg-icons';

import LoginExternFinalization from '../../pages/LoginExternFinalization';
import LayoutContainer from '../LayoutContainer';
import { loggedInUserIdSelector, selectedInstanceId, accessTokenSelector } from '../../redux/selectors/auth.js';
import { fetchUserIfNeeded } from '../../redux/modules/users.js';
import { getUser, fetchUserStatus } from '../../redux/selectors/users.js';
import { decode, isTokenValid, isTokenInNeedOfRefreshment } from '../../redux/helpers/token';
import { fetchUsersInstancesIfNeeded } from '../../redux/modules/instances.js';
import { fetchManyUserInstancesStatus } from '../../redux/selectors/instances.js';
import { fetchAllGroups } from '../../redux/modules/groups.js';
import { fetchManyGroupsStatus } from '../../redux/selectors/groups.js';
import { fetchAllUserMessages } from '../../redux/modules/systemMessages.js';
import { addNotification } from '../../redux/modules/notifications.js';
import { logout, refresh, selectInstance } from '../../redux/modules/auth.js';
import { getJsData, resourceStatus } from '../../redux/helpers/resourceManager';
import { userSwitching } from '../../redux/selectors/userSwitching.js';
import { refreshUserToken, removeUser as removeUserFromSwitching } from '../../redux/modules/userSwitching.js';
import { URL_PATH_PREFIX } from '../../helpers/config.js';
import { pathHasCustomLoadGroups, suspendAbortPendingRequestsOptimization } from '../../pages/routes.js';
import { LoadingIcon } from '../../components/icons';
import { SESSION_EXPIRED_MESSAGE } from '../../redux/helpers/api/tools.js';
import withRouter, { withRouterProps } from '../../helpers/withRouter.js';

import './recodex.css';

library.add(regularIcons, solidIcons, brandIcons);

const reloadIsRequired = (...statuses) =>
  (statuses.includes(resourceStatus.FAILED) || statuses.includes(resourceStatus.ABORTED)) &&
  !statuses.includes(resourceStatus.PENDING);

class App extends Component {
  static loadAsync =
    customLoadGroups =>
    (params, dispatch, { userId }) =>
      userId
        ? Promise.all([
            dispatch((dispatch, getState) =>
              dispatch(fetchUserIfNeeded(userId)).then(() => {
                const state = getState();
                if (!selectedInstanceId(state)) {
                  const user = getJsData(getUser(userId)(state));
                  dispatch(selectInstance(user.privateData.instancesIds[0]));
                }
                return !customLoadGroups ? dispatch(fetchAllGroups()) : Promise.resolve();
              })
            ),
            dispatch(fetchUsersInstancesIfNeeded(userId)),
            dispatch(fetchAllUserMessages()),
          ]).catch(response => {
            if (response && response.status === 403) {
              dispatch(logout()); // if requests demanding basic info about user are unauthorized, the user is either blocked or something fishy is going on...
            }
          })
        : Promise.resolve();

  constructor() {
    super();
    this.isRefreshingToken = false;
    this.reloadsCount = 0;
  }

  componentDidMount() {
    const hasCustomLoadGroups = pathHasCustomLoadGroups(this.props.location.pathname + this.props.location.search);
    this.props.loadAsync(this.props.userId, hasCustomLoadGroups);
    this.reloadsCount = 0;
  }

  componentDidUpdate(prevProps) {
    this.checkAuthentication();

    const hadCustomLoadGroups = pathHasCustomLoadGroups(prevProps.location.pathname + prevProps.location.search);
    const hasCustomLoadGroups = pathHasCustomLoadGroups(this.props.location.pathname + this.props.location.search);

    if (this.props.userId !== prevProps.userId || (hadCustomLoadGroups && !hasCustomLoadGroups)) {
      this.reloadsCount = 0;
    }

    if (
      this.props.userId !== prevProps.userId ||
      (hadCustomLoadGroups && !hasCustomLoadGroups) ||
      (this.reloadsCount < 3 &&
        reloadIsRequired(
          this.props.fetchUserStatus,
          !pathHasCustomLoadGroups && this.props.fetchManyGroupsStatus,
          this.props.fetchManyUserInstancesStatus
        ))
    ) {
      this.reloadsCount++;
      this.props.loadAsync(this.props.userId, hasCustomLoadGroups);
    }
  }

  /**
   * The validation in react-router does not cover all cases - validity of the token
   * must be checked more often.
   */
  checkAuthentication = () => {
    const {
      isLoggedIn,
      accessToken,
      refreshToken,
      logout,
      addNotification,
      userSwitchingState,
      userId,
      removeUserFromSwitching,
      refreshUserToken,
    } = this.props;

    const token = accessToken ? accessToken.toJS() : null;
    if (isLoggedIn) {
      if (!isTokenValid(token)) {
        logout();
        addNotification(SESSION_EXPIRED_MESSAGE, false);
      } else if (isTokenInNeedOfRefreshment(token) && !this.isRefreshingToken) {
        suspendAbortPendingRequestsOptimization();
        this.isRefreshingToken = true;
        refreshToken()
          .catch(() => {
            logout();
            addNotification(SESSION_EXPIRED_MESSAGE, false);
          })
          .then(() => {
            this.isRefreshingToken = false;
          });
      }
    }

    if (userSwitchingState) {
      Object.keys(userSwitchingState)
        .map(id => userSwitchingState[id])
        .forEach(({ accessToken, user, refreshing = false }) => {
          if (user.id !== userId && !refreshing) {
            const decodedToken = decode(accessToken);
            if (!accessToken || !isTokenValid(decodedToken)) {
              removeUserFromSwitching(user.id);
            } else if (isTokenInNeedOfRefreshment(decodedToken)) {
              refreshUserToken(user.id, accessToken);
            }
          }
        });
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
      <Routes>
        <Route path={`${URL_PATH_PREFIX}/login-extern/:service`} element={<LoginExternFinalization />} />
        <Route path="*" element={<LayoutContainer />} />
      </Routes>
    );
  }
}

App.propTypes = {
  accessToken: PropTypes.object,
  userId: PropTypes.string,
  instanceId: PropTypes.string,
  isLoggedIn: PropTypes.bool.isRequired,
  userSwitchingState: PropTypes.object,
  fetchUserStatus: PropTypes.string,
  fetchManyGroupsStatus: PropTypes.string,
  fetchManyUserInstancesStatus: PropTypes.string,
  loadAsync: PropTypes.func.isRequired,
  refreshToken: PropTypes.func.isRequired,
  refreshUserToken: PropTypes.func.isRequired,
  removeUserFromSwitching: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired,
  location: withRouterProps.location,
};

export default withRouter(
  connect(
    state => {
      const userId = loggedInUserIdSelector(state);
      return {
        accessToken: accessTokenSelector(state),
        userId,
        instanceId: selectedInstanceId(state),
        isLoggedIn: Boolean(userId),
        userSwitchingState: userSwitching(state),
        fetchUserStatus: fetchUserStatus(state, userId),
        fetchManyGroupsStatus: fetchManyGroupsStatus(state),
        fetchManyUserInstancesStatus: fetchManyUserInstancesStatus(state, userId),
      };
    },
    dispatch => ({
      loadAsync: (userId, hasCustomLoadGroups) => App.loadAsync(hasCustomLoadGroups)({}, dispatch, { userId }),
      refreshToken: () => dispatch(refresh()),
      refreshUserToken: (userId, token) => dispatch(refreshUserToken(userId, token)),
      removeUserFromSwitching: id => dispatch(removeUserFromSwitching(id)),
      logout: () => dispatch(logout()),
      addNotification: (msg, successful) => dispatch(addNotification(msg, successful)),
    })
  )(App)
);
