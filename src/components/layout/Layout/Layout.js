import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import classnames from 'classnames';

import Header from '../Header';
import Footer from '../Footer';

import SidebarContainer from '../../../containers/SidebarContainer';
import { getConfigVar } from '../../../helpers/config.js';

const title = getConfigVar('TITLE');

const Layout = ({
  toggleSize,
  toggleVisibility,
  isLoggedIn,
  sidebarIsCollapsed,
  sidebarIsOpen,
  pendingFetchOperations,
  children,
  lang,
  setLang,
  currentUrl,
  availableLangs,
  onCloseSidebar,
  relatedGroupId,
  memberGroups,
  fetchManyGroupsStatus,
}) => (
  <div
    className={classnames({
      wrapper: true,
      'sidebar-mini': true,
      'sidebar-collapse': sidebarIsCollapsed,
      'sidebar-open': sidebarIsOpen,
    })}
    style={{
      overflow: 'visible',
    }}>
    <Helmet defaultTitle={`${title}`} titleTemplate={`%s | ${title}`} />
    <Header
      isLoggedIn={isLoggedIn}
      toggleSidebarSize={toggleSize}
      toggleSidebarVisibility={toggleVisibility}
      availableLangs={availableLangs}
      currentLang={lang}
      setLang={setLang}
      currentUrl={currentUrl}
      relatedGroupId={relatedGroupId}
      memberGroups={memberGroups}
      fetchManyGroupsStatus={fetchManyGroupsStatus}
    />
    <SidebarContainer
      isCollapsed={sidebarIsCollapsed}
      small={!sidebarIsOpen && sidebarIsCollapsed} // does not always work, but is good enough
      currentUrl={currentUrl}
      pendingFetchOperations={pendingFetchOperations}
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
  isLoggedIn: PropTypes.bool,
  sidebarIsCollapsed: PropTypes.bool,
  sidebarIsOpen: PropTypes.bool,
  pendingFetchOperations: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
  children: PropTypes.element,
  lang: PropTypes.string,
  setLang: PropTypes.func.isRequired,
  currentUrl: PropTypes.string,
  availableLangs: PropTypes.array,
  relatedGroupId: PropTypes.string,
  memberGroups: PropTypes.object.isRequired,
  fetchManyGroupsStatus: PropTypes.string,
};

export default Layout;
