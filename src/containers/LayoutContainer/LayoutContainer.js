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

import en from 'react-intl/locale-data/en';
import messagesEn from '../../locales/en';

import cs from 'react-intl/locale-data/cs';
import messagesCs from '../../locales/cs';

class LayoutContainer extends Component {

  componentWillMount() {
    this.loadData(this.props);
    this.messages = {
      cs: messagesCs,
      en: messagesEn
    };
    this.localeData = { cs, en };
  }

  componentWillReceiveProps(newProps) {
    if (this.props.userId !== newProps.userId) {
      this.loadData(newProps);
    }
  }

  maybeHideSidebar = () => {
    const { sidebar, toggleSidebar } = this.props;
    if (sidebar.isOpen) {
      toggleSidebar.visibility();
    }
  };

  /**
   * Get messages for the given language or the deafult - English
   */
  getMessages = lang => this.messages[lang] || this.messages['en'];
  getLocaleData = lang => this.localeData[lang] || this.localeData['en'];

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
    const {
      params: { lang },
      children
    } = this.props;
    addLocaleData([ ...this.getLocaleData(lang) ]);
    return (
      <IntlProvider locale={lang} messages={this.getMessages(lang)}>
        <Layout {...this.props} onCloseSidebar={this.maybeHideSidebar} />
      </IntlProvider>
    );
  }

}

const mapStateToProps = (state) => ({
  sidebar: {
    isOpen: isVisible(state),
    isCollapsed: isCollapsed(state)
  },
  isLoggedIn: !!loggedInUserIdSelector(state),
  userId: loggedInUserIdSelector(state)
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
