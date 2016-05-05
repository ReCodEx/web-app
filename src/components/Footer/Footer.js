import React, { PropTypes } from 'react';

const Footer = ({
  version = '0.0.0'
}) => (
  <footer className='main-footer'>
    <div className='pull-right hidden-xs'>
      <b>Version</b> {version}
    </div>
    <strong>Copyright © 2016 <a href='http://github.com/recodex'>ReCodEx</a>.</strong> All rights reserved.
  </footer>
);

Footer.propTypes = {
  version: PropTypes.string
};

export default Footer;
