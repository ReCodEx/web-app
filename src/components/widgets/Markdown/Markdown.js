import React from 'react';
import PropTypes from 'prop-types';

const hljs = require('highlight.js');
const md = require('markdown-it')({
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (error) {
        /* just ignore the error */
      }
    }

    return ''; // use external default escaping
  },
}).use(require('@iktakahiro/markdown-it-katex'));

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
