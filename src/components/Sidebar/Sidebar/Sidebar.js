import React, { PropTypes } from 'react';

import Admin from '../Admin';
import LoggedIn from '../LoggedIn';
import NotLoggedIn from '../NotLoggedIn';

const Sidebar = ({ user = null, ...props }) => {
  if (!user) {
    return <NotLoggedIn {...props} />;
  } else if (user.isAdmin === true) {
    return <Admin user={user} {...props} />;
  } else {
    return <LoggedIn user={user} {...props} />;
  }
};

export default Sidebar;
