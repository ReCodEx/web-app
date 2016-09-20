import React, { PropTypes } from 'react';

// import Admin from '../Admin';
import LoggedIn from '../../../containers/LoggedInSidebarContainer';
import Public from '../Public';
import BadgeContainer from '../../../containers/BadgeContainer';

const Sidebar = ({
  isLoggedIn = false,
  ...props
}) => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      {isLoggedIn && (
        <div>
          <BadgeContainer />
          <LoggedIn {...props} />
        </div>
      )}
      <Public {...props} isLoggedIn={isLoggedIn} />
    </section>
  </aside>
);

Sidebar.propTypes = {
  isLoggedIn: PropTypes.bool
};

export default Sidebar;
