import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import moment from 'moment';

import { setLang } from '../../redux/modules/app.js';
import { getLang, anyPendingFetchOperations } from '../../redux/selectors/app.js';
import { isLoggedIn } from '../../redux/selectors/auth.js';
import { getLoggedInUserSettings, getLoggedInUserUiData } from '../../redux/selectors/users.js';
import { groupsLoggedUserIsMemberSelector, fetchManyGroupsStatus } from '../../redux/selectors/groups.js';

import Layout from '../../components/layout/Layout';
import { messages } from '../../locales';
import { UserUIDataContext, LinksContext, UrlContext } from '../../helpers/contexts.js';
import { buildRoutes, getLinks, pathRelatedGroupSelector } from '../../pages/routes.js';
import withRouter, { withRouterProps } from '../../helpers/withRouter.js';
import { canUseDOM } from '../../helpers/common.js';

import 'admin-lte/dist/css/adminlte.min.css';

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

  setInitialSidebarState = open => {
    const bootstrapCompactViewWidth = 991; // this may change with different versions of bootstrap
    if (window && window.document.body.clientWidth > bootstrapCompactViewWidth) {
      window.document.body.classList.remove(open === false ? 'sidebar-open' : 'sidebar-collapse');
      window.document.body.classList.add(open === false ? 'sidebar-collapse' : 'sidebar-open');
    }
  };

  componentDidMount() {
    if (canUseDOM) {
      this.setInitialSidebarState(this.props.userUIData.openedSidebar);
      this.newPageLoading = true;
      this.pageHeight = -1;
      this._scrollTargetToView();
    }
  }

  componentDidUpdate(prevProps) {
    if (canUseDOM) {
      if (
        (prevProps.userUIData.openedSidebar === undefined && this.props.userUIData.openedSidebar !== undefined) ||
        (prevProps.userUIData.openedSidebar !== undefined &&
          prevProps.userUIData.openedSidebar !== this.props.userUIData.openedSidebar)
      ) {
        this.setInitialSidebarState(this.props.userUIData.openedSidebar);
      }

      if (this.newPageLoading) {
        this._scrollTargetToView();
      }
    }

    if (!this.props.pendingFetchOperations) {
      this.newPageLoading = false;
    }
  }

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
                lang={lang}
                setLang={setLang}
                availableLangs={Object.keys(messages)}
                currentUrl={pathname}
                pendingFetchOperations={pendingFetchOperations}
                relatedGroupId={relatedGroupId}
                memberGroups={memberGroups}
                fetchManyGroupsStatus={fetchManyGroupsStatus}
                colorTheme={userUIData.darkTheme ? 'dark' : 'light' /* TODO: we might want to add a new option for global color theme, 'darkTheme' was originally used only for text editors */}>
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
      pendingFetchOperations: anyPendingFetchOperations(state),
      userSettings: getLoggedInUserSettings(state),
      userUIData: getLoggedInUserUiData(state),
      relatedGroupId: pathRelatedGroupSelector(state, pathname + search),
      memberGroups: groupsLoggedUserIsMemberSelector(state),
      fetchManyGroupsStatus: fetchManyGroupsStatus(state),
    }),
    dispatch => ({
      setLang: lang => {
        dispatch(setLang(lang));
        window.location.reload();
      },
    })
  )(LayoutContainer)
);
