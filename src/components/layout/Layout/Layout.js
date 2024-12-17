import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import Header from '../Header';
import Footer from '../Footer';

import SidebarContainer from '../../../containers/SidebarContainer';
import { getConfigVar } from '../../../helpers/config.js';

const title = getConfigVar('TITLE');

const Layout = ({
  isLoggedIn,
  pendingFetchOperations,
  children,
  lang,
  setLang,
  currentUrl,
  availableLangs,
  relatedGroupId,
  memberGroups,
  fetchManyGroupsStatus,
}) => (
  <div className="app-wrapper overflow-visible">
    <Helmet defaultTitle={`${title}`} titleTemplate={`%s | ${title}`} />
    <Header
      isLoggedIn={isLoggedIn}
      availableLangs={availableLangs}
      currentLang={lang}
      setLang={setLang}
      currentUrl={currentUrl}
      relatedGroupId={relatedGroupId}
      memberGroups={memberGroups}
      fetchManyGroupsStatus={fetchManyGroupsStatus}
    />
    <SidebarContainer currentUrl={currentUrl} pendingFetchOperations={pendingFetchOperations} />
    {children}
    <Footer version={process.env.VERSION} />
  </div>
);

Layout.propTypes = {
  isLoggedIn: PropTypes.bool,
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
