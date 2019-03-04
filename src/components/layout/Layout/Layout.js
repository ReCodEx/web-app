import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import classnames from 'classnames';

import Header from '../../widgets/Header';
import Footer from '../../widgets/Footer';

import SidebarContainer from '../../../containers/SidebarContainer';
import { getConfigVar } from '../../../redux/helpers/api/tools';

const title = getConfigVar('TITLE');

const Layout = ({
  toggleSize,
  toggleVisibility,
  sidebar,
  pendingFetchOperations,
  children,
  lang,
  currentUrl,
  availableLangs,
  onCloseSidebar,
}) => (
  <div
    className={classnames({
      wrapper: true,
      'sidebar-mini': true,
      'sidebar-collapse': sidebar.isCollapsed,
      'sidebar-open': sidebar.isOpen,
    })}
    style={{
      overflow: 'visible',
    }}>
    <Helmet defaultTitle={`${title}`} titleTemplate={`%s | ${title}`} />
    <Header
      toggleSidebarSize={toggleSize}
      toggleSidebarVisibility={toggleVisibility}
      availableLangs={availableLangs}
      currentLang={lang}
      currentUrl={currentUrl}
      pendingFetchOperations={pendingFetchOperations}
    />
    <SidebarContainer
      isCollapsed={sidebar.isCollapsed}
      small={!sidebar.isOpen && sidebar.isCollapsed} // does not always work, but is good enough
      currentUrl={currentUrl}
    />
    <div onClick={onCloseSidebar}>
      {children}
      <Footer version={process.env.VERSION} />
    </div>
  </div>
);

Layout.propTypes = {
  toggleSize: PropTypes.func,
  toggleVisibility: PropTypes.func,
  sidebar: PropTypes.shape({
    isCollapsed: PropTypes.bool,
    isOpen: PropTypes.bool,
  }),
  pendingFetchOperations: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
  children: PropTypes.element,
  lang: PropTypes.string,
  currentUrl: PropTypes.string,
  availableLangs: PropTypes.array,
};

export default Layout;
