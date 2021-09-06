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
import { getLoggedInUserSettings } from '../../redux/selectors/users';
import { groupsLoggedUserIsMemberSelector } from '../../redux/selectors/groups';

import Layout from '../../components/layout/Layout';
import { messages } from '../../locales';
import { UserSettingsContext, LinksContext, UrlContext } from '../../helpers/contexts';
import { buildRoutes, getLinks, pathRelatedGroupSelector } from '../../pages/routes';

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
  componentDidMount() {
    this.resizeSidebarToDefault(this.props);
    if (canUseDOM && (window.location.hash || this.props.location.hash)) {
      window.location.hash = this.props.location.hash;
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.userSettings.openedSidebar === undefined && this.props.userSettings.openedSidebar !== undefined) ||
      (prevProps.userSettings.openedSidebar !== undefined &&
        prevProps.userSettings.openedSidebar !== this.props.userSettings.openedSidebar)
    ) {
      this.resizeSidebarToDefault(this.props);
    }

    if (canUseDOM && (window.location.hash || this.props.location.hash)) {
      window.location.hash = this.props.location.hash;
    }
  }

  resizeSidebarToDefault({ collapse, unroll, userSettings }) {
    // open or hide the sidebar based on user's settings
    const shouldBeOpen = this.getDefaultOpenedSidebar(userSettings);
    shouldBeOpen ? unroll() : collapse();
  }

  getDefaultOpenedSidebar = userSettings =>
    userSettings && typeof userSettings.openedSidebar !== 'undefined' ? userSettings.openedSidebar : true;

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
      userSettings,
      setLang,
      relatedGroupId,
      memberGroups,
    } = this.props;

    moment.locale(lang);

    return (
      <IntlProvider locale={lang} messages={this.getMessages(lang)} formats={ADDITIONAL_INTL_FORMATS}>
        <UserSettingsContext.Provider value={userSettings}>
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
                memberGroups={memberGroups}>
                {buildRoutes(pathname + search, isLoggedIn)}
              </Layout>
            </UrlContext.Provider>
          </LinksContext.Provider>
        </UserSettingsContext.Provider>
      </IntlProvider>
    );
  }
}

LayoutContainer.contextTypes = {
  router: PropTypes.object,
};

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
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
  userSettings: PropTypes.object,
  relatedGroupId: PropTypes.string,
  memberGroups: PropTypes.object.isRequired,
};

export default connect(
  (state, { location: { pathname, search } }) => ({
    lang: getLang(state),
    isLoggedIn: isLoggedIn(state),
    sidebarIsCollapsed: isCollapsed(state),
    sidebarIsOpen: isVisible(state),
    pendingFetchOperations: anyPendingFetchOperations(state),
    userSettings: getLoggedInUserSettings(state),
    relatedGroupId: pathRelatedGroupSelector(state, pathname + search),
    memberGroups: groupsLoggedUserIsMemberSelector(state),
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
)(LayoutContainer);
