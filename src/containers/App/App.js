import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  loggedInUserIdSelector,
  accessTokenSelector
} from '../../redux/selectors/auth';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUserSettings } from '../../redux/selectors/users';
import { isTokenValid, willExpireSoon } from '../../redux/helpers/token';
import { fetchUsersInstancesIfNeeded } from '../../redux/modules/instances';
import { fetchUsersGroupsIfNeeded } from '../../redux/modules/groups';
import { logout, refresh } from '../../redux/modules/auth';

class App extends Component {
  static loadAsync = (params, dispatch, userId) =>
    (userId
      ? Promise.all([
        dispatch(fetchUserIfNeeded(userId)),
        dispatch(fetchUsersGroupsIfNeeded(userId)),
        dispatch(fetchUsersInstancesIfNeeded(userId))
      ])
      : Promise.resolve());

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
      } else if (willExpireSoon(token) && !this.isRefreshingToken) {
        this.isRefreshingToken = true;
        refreshToken().catch(() => logout()).then(() => {
          this.isRefreshingToken = false;
        });
      }
    }
  };

  render() {
    return this.props.children;
  }
}

App.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  userId: PropTypes.string,
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
      isLoggedIn: Boolean(userId),
      userSettings: getUserSettings(userId)(state)
    };
  },
  dispatch => ({
    loadAsync: userId => App.loadAsync({}, dispatch, userId),
    refreshToken: () => dispatch(refresh()),
    logout: () => dispatch(logout('/'))
  })
)(App);
