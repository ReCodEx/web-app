import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import MediaQuery from 'react-responsive';

import HeaderNotificationsContainer from '../../../containers/HeaderNotificationsContainer';
import HeaderSystemMessagesContainer from '../../../containers/HeaderSystemMessagesContainer';
import HeaderLanguageSwitching from '../HeaderLanguageSwitching';
import ClientOnly from '../../helpers/ClientOnly';
import Icon, { LoadingIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

class Header extends Component {
  toggleSidebarSize = e => {
    e.preventDefault();
    this.props.toggleSidebarSize();
  };

  toggleSidebarVisibility = e => {
    e.preventDefault();
    this.props.toggleSidebarVisibility();
  };

  render() {
    const { isLoggedIn, availableLangs = [], currentLang, setLang, pendingFetchOperations } = this.props;

    return (
      <nav className="main-header navbar navbar-expand navbar-green navbar-dark">
        <ClientOnly>
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" data-widget="pushmenu" href="#" onClick={this.toggleSidebarSize}>
                <Icon icon="bars" />
              </a>
            </li>
          </ul>

          {/* <MediaQuery maxWidth={767}>
            <a href="#" className="sidebar-toggle" role="button" onClick={this.toggleSidebarVisibility}>
              <span className="sr-only">
                <FormattedMessage id="app.header.toggleSidebar" defaultMessage="Show/hide sidebar" />
              </span>
            </a>
          </MediaQuery>
          <MediaQuery minWidth={768}>
            <a
              href="#"
              className="sidebar-toggle"
              role="button"
              onClick={this.toggleSidebarSize}
              style={{ fontFamily: 'sans' }}>
              <span className="sr-only">
                <FormattedMessage id="app.header.toggleSidebarSize" defaultMessage="Expand/minimize sidebar" />
              </span>
            </a>
              </MediaQuery> */}
        </ClientOnly>

        <ul className="navbar-nav ml-auto">
          {isLoggedIn && <HeaderSystemMessagesContainer locale={currentLang} />}
          <HeaderNotificationsContainer />
          {availableLangs.map(lang => (
            <HeaderLanguageSwitching lang={lang} active={currentLang === lang} key={lang} setLang={setLang} />
          ))}
        </ul>
      </nav>
    );
  }
}

Header.propTypes = {
  isLoggedIn: PropTypes.bool,
  toggleSidebarSize: PropTypes.func.isRequired,
  toggleSidebarVisibility: PropTypes.func.isRequired,
  currentLang: PropTypes.string.isRequired,
  setLang: PropTypes.func.isRequired,
  availableLangs: PropTypes.array,
  currentUrl: PropTypes.string,
};

export default Header;
