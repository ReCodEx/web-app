import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../../components/Layout';

import { toggleSize, toggleVisibility } from '../../redux/modules/sidebar';
import { logout } from '../../redux/modules/auth';
import { isVisible, isCollapsed } from '../../redux/selectors/sidebar';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { usersGroupsIds } from '../../redux/selectors/users';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchUsersGroupsIfNeeded } from '../../redux/modules/groups';
import { fetchUsersInstancesIfNeeded } from '../../redux/modules/instances';

class LayoutContainer extends Component {

  componentWillMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.userId !== newProps.userId) {
      this.loadData(newProps);
    }
  }

  maybeHideSidebar = () => {
    const { sidebar, toggleSidebar } = this.props;
    if (sidebar.isOpen) {
      toggleSidebar.visibility();
    }
  };

  loadData = ({
    isLoggedIn,
    userId,
    loadUserDataIfNeeded,
    loadUsersGroupsIfNeeded,
    loadUsersInstancesIfNeeded
  }) => {
    if (isLoggedIn === true) {
      loadUserDataIfNeeded(userId);
      loadUsersGroupsIfNeeded(userId);
      loadUsersInstancesIfNeeded(userId);
    }
  };

  render() {
    return <Layout {...this.props} onContentClick={this.maybeHideSidebar} />;
  }

}

const mapStateToProps = (state) => ({
  sidebar: {
    isOpen: isVisible(state),
    isCollapsed: isCollapsed(state)
  },
  isLoggedIn: !!loggedInUserIdSelector(state),
  userId: loggedInUserIdSelector(state)
});

const mapDispatchToProps = (dispatch, props) => ({
  toggleSidebar: {
    visibility: () => dispatch(toggleVisibility()),
    size: () => dispatch(toggleSize())
  },
  logout: () => dispatch(logout()),
  loadUserDataIfNeeded: (userId) => dispatch(fetchUserIfNeeded(userId)),
  loadUsersGroupsIfNeeded: (userId) => dispatch(fetchUsersGroupsIfNeeded(userId)),
  loadUsersInstancesIfNeeded: (userId) => dispatch(fetchUsersInstancesIfNeeded(userId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayoutContainer);
