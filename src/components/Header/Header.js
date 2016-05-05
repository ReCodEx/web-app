import React, { PropTypes } from 'react';
import { IndexLink } from 'react-router';
import MediaQuery from 'react-responsive';

export const Header = ({
  toggleSidebarSize,
  toggleSidebarVisibility
}) => (
  <header className='main-header'>

    <IndexLink to='/' className='logo'>
      <span className='logo-mini'>Re<b>C</b></span>
      <span className='logo-lg'>Re<b>CodEx</b></span>
    </IndexLink>

    <div className='navbar navbar-static-top' role='navigation'>
      <MediaQuery maxWidth={767}>
        <a href='#' className='sidebar-toggle' role='button' onClick={toggleSidebarVisibility}>
          <span className='sr-only'>Toggle navigation</span>
        </a>
      </MediaQuery>
      <MediaQuery minWidth={768}>
        <a href='#' className='sidebar-toggle' role='button' onClick={toggleSidebarSize}>
          <span className='sr-only'>Toggle navigation</span>
        </a>
      </MediaQuery>
    </div>


  </header>
);

Header.propTypes = {
  toggleSidebarSize: PropTypes.func.isRequired,
  toggleSidebarVisibility: PropTypes.func.isRequired
};

export default Header;
