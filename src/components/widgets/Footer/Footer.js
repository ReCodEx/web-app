import React from 'react';
import PropTypes from 'prop-types';
import { FormattedHTMLMessage } from 'react-intl';

const Footer = ({ version }) => (
  <footer className="main-footer">
    <div className="pull-right hidden-xs">
      <FormattedHTMLMessage
        id="app.footer.version"
        defaultMessage="<strong>Version</strong> {version} (<a href='{changelogUrl}' target='_blank'>changelog</a>)"
        values={{
          version,
          changelogUrl: 'https://github.com/ReCodEx/wiki/wiki/Changelog',
        }}
      />
    </div>
    <FormattedHTMLMessage
      id="app.footer.copyright"
      defaultMessage="Copyright © 2016-{year} <a href='{website}' target='_blank'>ReCodEx</a>. All rights reserved."
      values={{
        website: 'http://github.com/recodex',
        year: Math.max(new Date().getFullYear(), 2018),
      }}
    />
  </footer>
);

Footer.propTypes = {
  version: PropTypes.string.isRequired,
};

export default Footer;
