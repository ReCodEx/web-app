import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import Layout from '../../components/Layout';

import { toggleSize, toggleVisibility } from '../../redux/modules/sidebar';
import { logout } from '../../redux/modules/auth';
import { isVisible, isCollapsed } from '../../redux/selectors/sidebar';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { usersGroupsIds } from '../../redux/selectors/users';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchUsersGroupsIfNeeded } from '../../redux/modules/groups';
import { fetchUsersInstancesIfNeeded } from '../../redux/modules/instances';
import { messages, localeData, defaultLanguage } from '../../locales';
import { linksFactory } from '../../links';

class LayoutContainer extends Component {

  componentWillMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.userId !== newProps.userId) {
      this.loadData(newProps);
    }
  }

  getChildContext = () => ({
    links: linksFactory(this.props.params.lang)
  });

  maybeHideSidebar = () => {
    const { sidebar, toggleSidebar } = this.props;
    if (sidebar.isOpen) {
      toggleSidebar.visibility();
    }
  };

  /**
   * Get messages for the given language or the deafult - English
   */

  getLang = () => {
    let lang = this.props.params.lang;
    if (!lang) {
      lang = defaultLanguage;
    }

    return lang;
  };

  getMessages = lang => messages[lang] || messages[this.getDefaultLang()];
  getLocaleData = lang => localeData[lang] || localeData[this.getDefaultLang()];

  loadData = ({
    isLoggedIn,
    userId,
    loadUserDataIfNeeded,
    loadUsersGroupsIfNeeded,
    loadUsersInstancesIfNeeded
  }) => {
    if (isLoggedIn === true) {
      loadUserDataIfNeeded(userId);
      loadUsersGroupsIfNeeded(userId);
      loadUsersInstancesIfNeeded(userId);
    }
  };

  render() {
    const { children, currentUrl } = this.props;
    const lang = this.getLang();
    addLocaleData([ ...this.getLocaleData(lang) ]);
    return (
      <IntlProvider locale={lang} messages={this.getMessages(lang)}>
        <Layout
          {...this.props}
          onCloseSidebar={this.maybeHideSidebar}
          lang={lang}
          availableLangs={Object.keys(messages)}
          currentUrl={currentUrl} />
      </IntlProvider>
    );
  }

}

LayoutContainer.childContextTypes = {
  links: PropTypes.object
};

const mapStateToProps = (state) => ({
  sidebar: {
    isOpen: isVisible(state),
    isCollapsed: isCollapsed(state)
  },
  isLoggedIn: !!loggedInUserIdSelector(state),
  userId: loggedInUserIdSelector(state),
  currentUrl: state.routing.locationBeforeTransitions.pathname
});

const mapDispatchToProps = (dispatch, props) => ({
  toggleSidebar: {
    visibility: () => dispatch(toggleVisibility()),
    size: () => dispatch(toggleSize())
  },
  logout: () => dispatch(logout()),
  loadUserDataIfNeeded: (userId) => dispatch(fetchUserIfNeeded(userId)),
  loadUsersGroupsIfNeeded: (userId) => dispatch(fetchUsersGroupsIfNeeded(userId)),
  loadUsersInstancesIfNeeded: (userId) => dispatch(fetchUsersInstancesIfNeeded(userId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayoutContainer);
