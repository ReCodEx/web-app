import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Redirect, Switch, withRouter } from 'react-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far as regularIcons } from '@fortawesome/free-regular-svg-icons';
import { fas as solidIcons } from '@fortawesome/free-solid-svg-icons';
import { fab as brandIcons } from '@fortawesome/free-brands-svg-icons';

import LoginExternFinalization from '../../pages/LoginExternFinalization';
import LayoutContainer from '../LayoutContainer';
import { loggedInUserIdSelector, selectedInstanceId, accessTokenSelector } from '../../redux/selectors/auth';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser, fetchUserStatus } from '../../redux/selectors/users';
import { decode, isTokenValid, isTokenInNeedOfRefreshment } from '../../redux/helpers/token';
import { fetchUsersInstancesIfNeeded } from '../../redux/modules/instances';
import { fetchManyUserInstancesStatus } from '../../redux/selectors/instances';
import { fetchAllGroups } from '../../redux/modules/groups';
import { fetchManyGroupsStatus } from '../../redux/selectors/groups';
import { fetchAllUserMessages } from '../../redux/modules/systemMessages';
import { addNotification } from '../../redux/modules/notifications';
import { logout, refresh, selectInstance } from '../../redux/modules/auth';
import { getJsData, resourceStatus } from '../../redux/helpers/resourceManager';
import { userSwitching } from '../../redux/selectors/userSwitching';
import { refreshUserToken, removeUser as removeUserFromSwitching } from '../../redux/modules/userSwitching';
import { URL_PATH_PREFIX } from '../../helpers/config';
import { pathHasCustomLoadGroups } from '../../pages/routes';
import { knownLocales } from '../../helpers/localizedData';
import { LoadingIcon } from '../../components/icons';
import { abortAllPendingRequests, SESSION_EXPIRED_MESSAGE } from '../../redux/helpers/api/tools';

import './recodex.css';

library.add(regularIcons, solidIcons, brandIcons);

const _removePrefix = (str, prefix) => (prefix && str.startsWith(prefix) ? str.substr(prefix.length) : str);

// Backward compatibility (if lang appear in URL, we just remove it)
const removeLangFromUrl = url => {
  url = _removePrefix(url, URL_PATH_PREFIX);
  url = _removePrefix(url, '/');
  url = url.replace(new RegExp(`^(${knownLocales.join('|')})/?`), '');
  return `${URL_PATH_PREFIX}/${url}`;
};

const someStatusesFailed = (...statuses) =>
  statuses.includes(resourceStatus.FAILED) && !statuses.includes(resourceStatus.PENDING);

class App extends Component {
  static ignoreNextLocationChangeFlag = false;

  static ignoreNextLocationChange = () => {
    App.ignoreNextLocationChangeFlag = true;
  };

  static loadAsync = customLoadGroups => (params, dispatch, { userId }) =>
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
  }

  componentDidMount() {
    const hasCustomLoadGroups = pathHasCustomLoadGroups(this.props.location.pathname + this.props.location.search);
    this.props.loadAsync(this.props.userId, hasCustomLoadGroups);

    /*
     * Checking location changes to stop pending API calls which are no longer necessary.
     */
    let lastLocation = this.props.location;
    this.removeHistoryListen = this.props.history.listen((location, action) => {
      if (action === 'PUSH') {
        // push means link click or push() call, other types are tricky, so we rather avoid them
        if (App.ignoreNextLocationChangeFlag) {
          App.ignoreNextLocationChangeFlag = false;
        } else if (
          !this.isRefreshingToken && // if token is being refreshed, we do not want to abort that
          (lastLocation.pathname !== location.pathname || lastLocation.search !== location.search) // is there an actual URL change?
        ) {
          abortAllPendingRequests();
        }
      }
      lastLocation = location;
    });
  }

  componentWillUnmount() {
    this.removeHistoryListen && this.removeHistoryListen();
  }

  componentDidUpdate(prevProps) {
    this.checkAuthentication();

    const hadCustomLoadGroups = pathHasCustomLoadGroups(prevProps.location.pathname + prevProps.location.search);
    const hasCustomLoadGroups = pathHasCustomLoadGroups(this.props.location.pathname + this.props.location.search);
    if (
      this.props.userId !== prevProps.userId ||
      (hadCustomLoadGroups && !hasCustomLoadGroups) ||
      someStatusesFailed(
        this.props.fetchUserStatus,
        !pathHasCustomLoadGroups && this.props.fetchManyGroupsStatus,
        this.props.fetchManyUserInstancesStatus
      )
    ) {
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
      <Switch>
        <Route exact path={`${URL_PATH_PREFIX}/login-extern/:service`} component={LoginExternFinalization} />
        <Route
          path={knownLocales.map(lang => `${URL_PATH_PREFIX}/${lang}/`)}
          render={({ location }) => <Redirect to={removeLangFromUrl(location.pathname) + location.search} />}
        />
        <Route path="*" component={LayoutContainer} />
      </Switch>
    );
  }
}

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    listen: PropTypes.func,
  }).isRequired,
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
};

export default connect(
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
)(withRouter(App));
