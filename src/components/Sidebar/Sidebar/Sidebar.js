import React, { PropTypes } from 'react';

// import Admin from '../Admin';
import LoggedIn from '../../../containers/LoggedInSidebarContainer';
import NotLoggedIn from '../NotLoggedIn';

const Sidebar = ({
  isLoggedIn = false,
  ...props
}) =>
  !isLoggedIn
    ? <NotLoggedIn {...props} />
    : <LoggedIn {...props} />;

Sidebar.propTypes = {
  isLoggedIn: PropTypes.bool
};

export default Sidebar;
