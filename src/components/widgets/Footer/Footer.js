import React, { PropTypes } from 'react';
import { FormattedHTMLMessage } from 'react-intl';

const Footer = ({
  version
}) => (
  <footer className="main-footer">
    <div className="pull-right hidden-xs">
      <FormattedHTMLMessage id="app.footer.version" defaultMessage="<strong>Version</strong> {version}" values={{ version }} />
    </div>
    <FormattedHTMLMessage
      id="app.footer.copyright"
      defaultMessage='Copyright © 2016 <a href="{website}">ReCodEx</a>. All rights reserved.'
      values={{
        website: 'http://github.com/recodex'
      }} />
  </footer>
);

Footer.propTypes = {
  version: PropTypes.string.isRequired
};

export default Footer;
