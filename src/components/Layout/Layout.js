import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Helmet from 'react-helmet';
import classNames from 'classnames';

import Header from '../AdminLTE/Header';
import Sidebar from '../Sidebar';
import PageContent from '../PageContent';
import Footer from '../AdminLTE/Footer';

export const Layout = ({
  toggleSidebar,
  sidebar,
  isLoggedIn,
  logout,
  children,
  onContentClick
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
      logout={logout}
      isCollapsed={sidebar.isCollapsed} />
    <div onClick={onContentClick}>
      {children}
    </div>
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
