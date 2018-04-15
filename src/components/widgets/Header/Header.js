import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { IndexLink } from 'react-router';
import MediaQuery from 'react-responsive';
import HeaderNotificationsContainer from '../../../containers/HeaderNotificationsContainer';
import HeaderLanguageSwitching from '../HeaderLanguageSwitching';
import ClientOnly from '../../helpers/ClientOnly';

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
    const {
      availableLangs = [],
      currentLang,
      currentUrl = '',
      links: { HOME_URI }
    } = this.props;

    return (
      <header className="main-header fixed">
        <IndexLink to={HOME_URI} className="logo">
          <span className="logo-mini">
            Re<b>C</b>
          </span>
          <span className="logo-lg">
            Re<b>CodEx</b>
          </span>
        </IndexLink>

        <div className="navbar navbar-static-top" role="navigation">
          <ClientOnly>
            <MediaQuery maxWidth={767} values={{ deviceWidth: 1368 }}>
              <a
                href="#"
                className="sidebar-toggle"
                role="button"
                onClick={this.toggleSidebarVisibility}
              >
                <span className="sr-only">
                  <FormattedMessage
                    id="app.header.toggleSidebar"
                    defaultMessage="Show/hide sidebar"
                  />
                </span>
              </a>
            </MediaQuery>
            <MediaQuery minWidth={768} values={{ deviceWidth: 1368 }}>
              <a
                href="#"
                className="sidebar-toggle"
                role="button"
                onClick={this.toggleSidebarSize}
                style={{ fontFamily: 'sans' }}
              >
                <span className="sr-only">
                  <FormattedMessage
                    id="app.header.toggleSidebarSize"
                    defaultMessage="Expand/minimize sidebar"
                  />
                </span>
              </a>
            </MediaQuery>
          </ClientOnly>
          <div className="navbar-custom-menu">
            <ul className="nav navbar-nav">
              <HeaderNotificationsContainer />
              {availableLangs.map(lang =>
                <HeaderLanguageSwitching
                  lang={lang}
                  active={currentLang === lang}
                  key={lang}
                  currentUrl={currentUrl}
                />
              )}
            </ul>
          </div>
        </div>
      </header>
    );
  }
}

Header.propTypes = {
  toggleSidebarSize: PropTypes.func.isRequired,
  toggleSidebarVisibility: PropTypes.func.isRequired,
  currentLang: PropTypes.string.isRequired,
  availableLangs: PropTypes.array,
  currentUrl: PropTypes.string,
  links: PropTypes.object
};

export default withLinks(Header);
