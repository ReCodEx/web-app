import React, { PropTypes } from 'react';
import classNames from 'classnames';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import PageContent from '../../components/PageContent';
import Footer from '../../components/Footer';

// global styles
import '../../styles/core.scss';
import 'admin-lte/bootstrap/css/bootstrap.min.css';
import 'admin-lte/dist/css/AdminLTE.min.css';
import 'admin-lte/dist/css/skins/skin-green.min.css';

export const Layout = ({
  toggleSidebar,
  sidebar,
  children
}) => (
  <div className={classNames({
    'wrapper': true,
    'sidebar-mini': true,
    'sidebar-collapse': sidebar.isCollapsed,
    'sidebar-open': sidebar.isOpen
  })}>
    <Header
      toggleSidebarSize={toggleSidebar.size}
      toggleSidebarVisibility={toggleSidebar.visibility} />
    <Sidebar />
    <PageContent
      title='Hlavní strana'
      description='Matematicko fyzikální faktulta UK v Praze - Informatická sekce'>
      {children}
    </PageContent>
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
  children: PropTypes.element.isRequired
};

export default Layout;
