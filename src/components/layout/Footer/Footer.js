import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

const Footer = ({ version }) => (
  <footer className="app-footer">
    <div className="float-end hidden-xs">
      <FormattedMessage
        id="app.footer.version"
        defaultMessage="<strong>Version</strong> {version} (<a>changelog</a>)"
        values={{
          version,
          strong: text => <strong key="version">{text}</strong>,
          a: caption => (
            <a key="link" href="https://github.com/ReCodEx/wiki/wiki/Changelog" target="_blank" rel="noreferrer">
              {caption}
            </a>
          ),
        }}
      />
    </div>
    <FormattedMessage
      id="app.footer.copyright"
      defaultMessage="Copyright © 2016-{year} <a>ReCodEx</a>. All rights reserved."
      values={{
        a: caption => (
          <a key="link" href="http://github.com/recodex" target="_blank" rel="noreferrer">
            {caption}
          </a>
        ),
        year: Math.max(new Date().getFullYear(), 2018),
      }}
    />
  </footer>
);

Footer.propTypes = {
  version: PropTypes.string.isRequired,
};

export default Footer;
