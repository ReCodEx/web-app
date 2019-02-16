import React from 'react';
import PropTypes from 'prop-types';

const md = require('markdown-it')().use(require('@iktakahiro/markdown-it-katex'));

const Markdown = ({ source }) => (
  <div
    dangerouslySetInnerHTML={{
      __html: md.render(source),
    }}
  />
);

Markdown.propTypes = {
  source: PropTypes.string.isRequired,
};

export default Markdown;
