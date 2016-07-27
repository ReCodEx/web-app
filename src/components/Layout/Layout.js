import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Helmet from 'react-helmet';

import Header from '../Header';
import Sidebar from '../Sidebar';
import PageContent from '../PageContent';
import Footer from '../Footer';

export const Layout = ({
  toggleSidebar,
  sidebar,
  isLoggedIn,
  logout,
  children
}) => (
  <div className={classNames({
    'wrapper': true,
    'sidebar-mini': true,
    'sidebar-collapse': sidebar.isCollapsed,
    'sidebar-open': sidebar.isOpen
  })}>
    <Helmet
      defaultTitle='ReCodEx'
      titleTemplate='%s | ReCodEx' />

    <Header
      toggleSidebarSize={toggleSidebar.size}
      toggleSidebarVisibility={toggleSidebar.visibility} />
    <Sidebar
      isLoggedIn={isLoggedIn}
      logout={logout} />
    {children}
    <Footer version='v0.1.0' />
  </div>
);

Layout.propTypes = {
  toggleSidebar: PropTypes.shape({
    size: PropTypes.func,
    visibility: PropTypes.func
  }),
  sidebar: PropTypes.shape({
    isCollapsed: PropTypes.bool,
    isOpen: PropTypes.bool
  }),
  isLoggedIn: PropTypes.bool,
  logout: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired
};

export default Layout;
