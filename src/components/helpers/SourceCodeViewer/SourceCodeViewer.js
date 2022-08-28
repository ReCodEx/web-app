import React from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { Prism as SyntaxHighlighter, createElement } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'prismjs/themes/prism.css';

import { getPrismModeFromExtension } from '../../helpers/syntaxHighlighting';

import './SourceCodeViewer.css';

const linesRenderer = ({ rows, stylesheet, useInlineStyles }) => {
  return rows.map((node, i) => (
    <React.Fragment key={`fragment-${i}`}>
      {createElement({
        node,
        stylesheet,
        useInlineStyles,
        key: `code-segement${i}`,
      })}
    </React.Fragment>
  ));
};

const linePropsGenerator = lineNumber => ({
  'data-line': lineNumber,
});

const SourceCodeViewer = ({ name, content = '' }) =>
  canUseDOM ? (
    <SyntaxHighlighter
      language={getPrismModeFromExtension(name.split('.').pop())}
      style={vs}
      className="sourceCodeViewer"
      showLineNumbers={true}
      showInlineLineNumbers={true}
      wrapLines={true}
      wrapLongLines={false}
      useInlineStyles={false}
      lineProps={linePropsGenerator}
      renderer={linesRenderer}>
      {content}
    </SyntaxHighlighter>
  ) : (
    <></>
  );

SourceCodeViewer.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string,
};

export default SourceCodeViewer;
