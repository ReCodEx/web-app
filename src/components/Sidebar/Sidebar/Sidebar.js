import React, { PropTypes } from 'react';

// import Admin from '../Admin';
import LoggedIn from '../../../containers/LoggedInSidebarContainer';
import NotLoggedIn from '../NotLoggedIn';

const Sidebar = ({
  isLoggedIn = false,
  ...props
}) => {
  if (!isLoggedIn) {
    return <NotLoggedIn {...props} />;
  } else {
    return <LoggedIn {...props} />;
  }
};

export default Sidebar;
