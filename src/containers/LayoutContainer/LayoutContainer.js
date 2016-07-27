import { asyncConnect } from 'redux-connect';
import Layout from '../../components/Layout';

import { toggleSize, toggleVisibility } from '../../redux/modules/sidebar';
import { logout } from '../../redux/modules/auth';
import { loggedInUserId } from '../../redux/selectors/auth';
import { usersGroupsIds } from '../../redux/selectors/users';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchGroupsIfNeeded } from '../../redux/modules/groups';

const mapStateToProps = (state) => ({
  sidebar: {
    isOpen: state.sidebar.visible,
    isCollapsed: state.sidebar.collapsed
  },
  isLoggedIn: !!loggedInUserId(state)
});

const mapDispatchToProps = (dispatch, props) => ({
  toggleSidebar: {
    visibility: () => dispatch(toggleVisibility()),
    size: () => dispatch(toggleSize())
  },
  logout: () => dispatch(logout())
});

const isLoggedIn = state => state.auth.accessToken !== null;
const fetchUserData = state => fetchUserIfNeeded(loggedInUserId(state));
const fetchUsersGroups = state => fetchGroupsIfNeeded(...usersGroupsIds(state));

export default asyncConnect(
  [
    {
      promise: ({ store: { dispatch, getState } }) =>
        isLoggedIn(getState()) &&
          Promise.all(dispatch(fetchUserData(getState())))
            .then(() =>
              Promise.all(dispatch(fetchUsersGroups(getState()))))
    }
  ],
  mapStateToProps,
  mapDispatchToProps
)(Layout);
