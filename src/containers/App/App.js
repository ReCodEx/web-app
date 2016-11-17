import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { loggedInUserIdSelector, accessTokenSelector } from '../../redux/selectors/auth';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { isTokenValid, willExpireSoon } from '../../redux/helpers/token';
import { fetchUsersInstancesIfNeeded } from '../../redux/modules/instances';
import { fetchUsersGroupsIfNeeded } from '../../redux/modules/groups';
import { logout, refresh } from '../../redux/modules/auth';

class App extends Component {

  componentWillMount() {
    App.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.loggedInUserId !== newProps.loggedInUserId) {
      App.loadData(newProps);
    }
  }

  static loadData = ({ isLoggedIn, userId, loadAsync }) => {
    if (isLoggedIn) {
      return loadAsync(userId);
    } else {
      return Promise.resolve();
    }
  };

  /**
   * The validation in react-router does not cover all cases - validity of the token
   * must be checked more often.
   */
  checkAuthentication = () => {
    const { isLoggedIn, accessToken, refreshToken, logout } = this.props;
    const token = accessToken ? accessToken.toJS() : null;
    if (isLoggedIn) {
      if (!isTokenValid(token)) {
        logout(this.context.links.HOME_URI);
      } else if (willExpireSoon(token) && !this.isRefreshingToken) {
        this.isRefreshingToken = true;
        refreshToken()
          .catch(() => logout(this.context.links.HOME_URI))
          .then(() => {
            this.isRefreshingToken = false;
          });
      }
    }
  };

  render() {
    return this.props.children;
  }

}

App.contextTypes = {
  links: PropTypes.object
};

App.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  loggedInUserId: PropTypes.string,
  accessToken: PropTypes.object,
  refreshToken: PropTypes.func,
  logout: PropTypes.func,
  children: PropTypes.element
};

export default connect(
  state => ({
    accessToken: accessTokenSelector(state),
    userId: loggedInUserIdSelector(state),
    isLoggedIn: !!loggedInUserIdSelector(state)
  }),
  dispatch => ({
    loadAsync: (userId) => Promise.all([
      dispatch(fetchUserIfNeeded(userId)),
      dispatch(fetchUsersGroupsIfNeeded(userId)),
      dispatch(fetchUsersInstancesIfNeeded(userId))
    ]),
    refreshToken: () => dispatch(refresh()),
    logout: (url) => dispatch(logout(url))
  })
)(App);
