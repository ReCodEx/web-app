import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { IndexLink } from 'react-router';
import MediaQuery from 'react-responsive';

import HeaderNotificationsContainer from '../../../containers/HeaderNotificationsContainer';
import HeaderSystemMessagesContainer from '../../../containers/HeaderSystemMessagesContainer';
import HeaderLanguageSwitching from '../HeaderLanguageSwitching';
import ClientOnly from '../../helpers/ClientOnly';
import { LoadingIcon } from '../../icons';
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
      pendingFetchOperations,
      links: { HOME_URI },
    } = this.props;

    return (
      <header className="main-header fixed">
        <IndexLink to={HOME_URI} className="logo">
          <span className="logo-mini">
            {pendingFetchOperations ? (
              <LoadingIcon gapRight />
            ) : (
              <React.Fragment>
                Re<b>C</b>
              </React.Fragment>
            )}
          </span>
          <span className="logo-lg">
            {pendingFetchOperations && (
              <span style={{ position: 'absolute', left: '1em' }}>
                <LoadingIcon gapRight />
              </span>
            )}
            Re<b>CodEx</b>
          </span>
        </IndexLink>

        <div className="navbar navbar-static-top" role="navigation">
          <ClientOnly>
            <MediaQuery maxWidth={767} values={{ deviceWidth: 1368 }}>
              <a href="#" className="sidebar-toggle" role="button" onClick={this.toggleSidebarVisibility}>
                <span className="sr-only">
                  <FormattedMessage id="app.header.toggleSidebar" defaultMessage="Show/hide sidebar" />
                </span>
              </a>
            </MediaQuery>
            <MediaQuery minWidth={768} values={{ deviceWidth: 1368 }}>
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
            </MediaQuery>
          </ClientOnly>
          <div className="navbar-custom-menu">
            <ul className="nav navbar-nav">
              <HeaderSystemMessagesContainer />
              <HeaderNotificationsContainer />
              {availableLangs.map(lang => (
                <HeaderLanguageSwitching lang={lang} active={currentLang === lang} key={lang} currentUrl={currentUrl} />
              ))}
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
  pendingFetchOperations: PropTypes.bool,
  links: PropTypes.object,
};

export default withLinks(Header);
