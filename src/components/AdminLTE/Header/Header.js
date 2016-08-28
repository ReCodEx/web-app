import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { IndexLink } from 'react-router';
import { Navbar } from 'react-bootstrap';
import MediaQuery from 'react-responsive';
import HeaderNotificationsContainer from '../../../containers/HeaderNotificationsContainer';
import HeaderLanguageSwitching from '../HeaderLanguageSwitching';

class Header extends Component {

  state = { canRenderClientOnly: false };

  componentWillMount = () => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        this.setState({ canRenderClientOnly: true });
      });
    }
  };

  render() {
    const { canRenderClientOnly } = this.state;

    const {
      toggleSidebarSize,
      toggleSidebarVisibility,
      availableLangs = [],
      currentLang,
      currentUrl = ''
    } = this.props;

    return (
      <header className='main-header fixed'>
        <IndexLink to='/' className='logo'>
          <span className='logo-mini'>Re<b>C</b></span>
          <span className='logo-lg'>Re<b>CodEx</b></span>
        </IndexLink>

        <div className='navbar navbar-static-top' role='navigation'>
          {canRenderClientOnly && (
            <div>
              <MediaQuery maxWidth={767}>
                <a href='#' className='sidebar-toggle' role='button' onClick={toggleSidebarVisibility}>
                  <span className='sr-only'>
                    <FormattedMessage id='app.header.toggleSidebar' defaultMessage='Show/hide sidebar' />
                  </span>
                </a>
              </MediaQuery>
              <MediaQuery minWidth={768}>
                <a href='#' className='sidebar-toggle' role='button' onClick={toggleSidebarSize}>
                  <span className='sr-only'>
                    <FormattedMessage id='app.header.toggleSidebarSize' defaultMessage='Expand/minimize sidebar' />
                  </span>
                </a>
              </MediaQuery>
            </div>
          )}
          <div className='navbar-custom-menu'>
            <ul className='nav navbar-nav'>
              <HeaderNotificationsContainer />
              {availableLangs.map(lang =>
                <HeaderLanguageSwitching lang={lang} active={currentLang === lang} key={lang} currentUrl={currentUrl} />)}
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
  currentUrl: PropTypes.string
};

export default Header;
