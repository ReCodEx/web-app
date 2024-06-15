import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import moment from 'moment';
import { canUseDOM } from 'exenv';

import { setLang } from '../../redux/modules/app';
import { toggleSize, toggleVisibility, collapse, unroll } from '../../redux/modules/sidebar';
import { getLang, anyPendingFetchOperations } from '../../redux/selectors/app';
import { isVisible, isCollapsed } from '../../redux/selectors/sidebar';
import { isLoggedIn } from '../../redux/selectors/auth';
import { getLoggedInUserSettings, getLoggedInUserUiData } from '../../redux/selectors/users';
import { groupsLoggedUserIsMemberSelector, fetchManyGroupsStatus } from '../../redux/selectors/groups';

import Layout from '../../components/layout/Layout';
import { messages } from '../../locales';
import { UserUIDataContext, LinksContext, UrlContext } from '../../helpers/contexts';
import { buildRoutes, getLinks, pathRelatedGroupSelector } from '../../pages/routes';
import withRouter, { withRouterProps } from '../../helpers/withRouter';

import 'admin-lte/dist/css/adminlte.min.css';
import 'admin-lte/plugins/overlayScrollbars/css/OverlayScrollbars.min.css';

const ADDITIONAL_INTL_FORMATS = {
  time: {
    '24hour': { hour12: false, hour: 'numeric', minute: 'numeric' },
    '24hourWithSeconds': {
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    },
  },
};

/**
 * Handles the dependency injection of the links.
 * Also controls the state of the sidebar - collapsing and showing the sidebar.
 */
class LayoutContainer extends Component {
  newPageLoading = false;
  pageHeight = 0;

  _scrollTargetToView() {
    if ((window.location.hash || this.props.location.hash) && this.pageHeight !== document.body.scrollHeight) {
      // this will enforce immediate scroll-to-view
      window.location.hash = this.props.location.hash;
      window.scrollBy({ top: -65, behavior: 'instant' }); // 65 is slightly more than LTE top-bar (which is 57px in height)
      this.pageHeight = document.body.scrollHeight; // make sure we scroll only if the render height changes
    }
  }

  componentDidMount() {
    this.resizeSidebarToDefault(this.props);
    if (canUseDOM) {
      this.newPageLoading = true;
      this.pageHeight = -1;
      this._scrollTargetToView();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.userUIData.openedSidebar === undefined && this.props.userUIData.openedSidebar !== undefined) ||
      (prevProps.userUIData.openedSidebar !== undefined &&
        prevProps.userUIData.openedSidebar !== this.props.userUIData.openedSidebar)
    ) {
      this.resizeSidebarToDefault(this.props);
    }

    if (canUseDOM && this.newPageLoading) {
      this._scrollTargetToView();
    }

    if (!this.props.pendingFetchOperations) {
      this.newPageLoading = false;
    }
  }

  resizeSidebarToDefault({ collapse, unroll, userUIData }) {
    // open or hide the sidebar based on user's settings
    const shouldBeOpen = this.getDefaultOpenedSidebar(userUIData);
    shouldBeOpen ? unroll() : collapse();
  }

  getDefaultOpenedSidebar = userUIData =>
    userUIData && typeof userUIData.openedSidebar !== 'undefined' ? userUIData.openedSidebar : true;

  maybeHideSidebar = e => {
    const { sidebarIsOpen, toggleVisibility } = this.props;
    if (sidebarIsOpen) {
      toggleVisibility();
    }
  };

  /**
   * Get messages for the given language or the deafult - English
   */

  getDefaultLang = () => {
    const { userSettings } = this.props;
    return userSettings && userSettings.defaultLanguage ? userSettings.defaultLanguage : 'en';
  };

  getMessages = lang => messages[lang] || messages[this.getDefaultLang()];

  render() {
    const {
      lang,
      location: { pathname, search },
      isLoggedIn,
      sidebarIsCollapsed,
      sidebarIsOpen,
      toggleSize,
      toggleVisibility,
      pendingFetchOperations,
      userUIData,
      setLang,
      relatedGroupId,
      memberGroups,
      fetchManyGroupsStatus,
    } = this.props;

    moment.locale(lang);

    return (
      <IntlProvider locale={lang} messages={this.getMessages(lang)} formats={ADDITIONAL_INTL_FORMATS}>
        <UserUIDataContext.Provider value={userUIData}>
          <LinksContext.Provider value={getLinks()}>
            <UrlContext.Provider value={{ lang }}>
              <Layout
                isLoggedIn={isLoggedIn}
                sidebarIsCollapsed={sidebarIsCollapsed}
                sidebarIsOpen={sidebarIsOpen}
                toggleSize={toggleSize}
                toggleVisibility={toggleVisibility}
                onCloseSidebar={this.maybeHideSidebar}
                lang={lang}
                setLang={setLang}
                availableLangs={Object.keys(messages)}
                currentUrl={pathname}
                pendingFetchOperations={pendingFetchOperations}
                relatedGroupId={relatedGroupId}
                memberGroups={memberGroups}
                fetchManyGroupsStatus={fetchManyGroupsStatus}>
                {buildRoutes(pathname + search, isLoggedIn)}
              </Layout>
            </UrlContext.Provider>
          </LinksContext.Provider>
        </UserUIDataContext.Provider>
      </IntlProvider>
    );
  }
}

LayoutContainer.propTypes = {
  lang: PropTypes.string,
  toggleSize: PropTypes.func.isRequired,
  toggleVisibility: PropTypes.func.isRequired,
  collapse: PropTypes.func.isRequired,
  unroll: PropTypes.func.isRequired,
  setLang: PropTypes.func.isRequired,
  pendingFetchOperations: PropTypes.bool,
  isLoggedIn: PropTypes.bool,
  sidebarIsCollapsed: PropTypes.bool,
  sidebarIsOpen: PropTypes.bool,
  location: withRouterProps.location,
  userSettings: PropTypes.object,
  userUIData: PropTypes.object,
  relatedGroupId: PropTypes.string,
  memberGroups: PropTypes.object.isRequired,
  fetchManyGroupsStatus: PropTypes.string,
};

export default withRouter(
  connect(
    (state, { location: { pathname, search } }) => ({
      lang: getLang(state),
      isLoggedIn: isLoggedIn(state),
      sidebarIsCollapsed: isCollapsed(state),
      sidebarIsOpen: isVisible(state),
      pendingFetchOperations: anyPendingFetchOperations(state),
      userSettings: getLoggedInUserSettings(state),
      userUIData: getLoggedInUserUiData(state),
      relatedGroupId: pathRelatedGroupSelector(state, pathname + search),
      memberGroups: groupsLoggedUserIsMemberSelector(state),
      fetchManyGroupsStatus: fetchManyGroupsStatus(state),
    }),
    dispatch => ({
      toggleVisibility: () => dispatch(toggleVisibility()),
      toggleSize: () => dispatch(toggleSize()),
      collapse: () => dispatch(collapse()),
      unroll: () => dispatch(unroll()),
      setLang: lang => {
        dispatch(setLang(lang));
        window.location.reload();
      },
    })
  )(LayoutContainer)
);
