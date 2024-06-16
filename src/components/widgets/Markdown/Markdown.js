import React from 'react';
import PropTypes from 'prop-types';

import hljs from 'highlight.js';
import markdownIT from 'markdown-it';
import katex from '@iktakahiro/markdown-it-katex';

const md = markdownIT({
  highlight: function (str, language) {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(str, { language }).value;
      } catch (error) {
        /* just ignore the error */
      }
    }

    return ''; // use external default escaping
  },
}).use(katex);

const Markdown = ({ source }) => (
  <div
    className="recodex-markdown-container"
    dangerouslySetInnerHTML={{
      __html: md.render(source),
    }}
  />
);

Markdown.propTypes = {
  source: PropTypes.string.isRequired,
};

export default Markdown;
