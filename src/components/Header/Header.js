import React, { Component, PropTypes } from 'react';
import { IndexLink } from 'react-router';
import MediaQuery from 'react-responsive';

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
      toggleSidebarVisibility
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
                  <span className='sr-only'>Zobrazit/skrýt boční panel</span>
                </a>
              </MediaQuery>
              <MediaQuery minWidth={768}>
                <a href='#' className='sidebar-toggle' role='button' onClick={toggleSidebarSize}>
                  <span className='sr-only'>Zvětšit/zmenšit boční panel</span>
                </a>
              </MediaQuery>
            </div>
          )}
        </div>
      </header>
    );
  }
}

Header.propTypes = {
  toggleSidebarSize: PropTypes.func.isRequired,
  toggleSidebarVisibility: PropTypes.func.isRequired
};

export default Header;
