import React, { PropTypes } from 'react';
import { canUseDOM } from 'exenv';

let CodeMirror = null;

if (canUseDOM) {
  CodeMirror = require('react-codemirror');
  require('codemirror/mode/clike/clike');
  require('codemirror/mode/pascal/pascal');
  require('codemirror/lib/codemirror.css');
  require('codemirror/theme/monokai.css');
}

const getMode = ext => {
  switch (ext) {
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
    case 'java':
    case 'cs':
      return 'clike';

    default:
      return ext;
  }
};


const SourceCodeViewer = ({
  name,
  content = '',
  lineNumbers = true,
  lines = 20
}) =>
  CodeMirror
    ? (
      <CodeMirror
        value={content}
        disabled
        options={{
          lineNumbers,
          mode: getMode(name.split('.').pop()),
          viewportMargin: lines
        }} />
    )
  : null;

SourceCodeViewer.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string,
  lineNumbers: PropTypes.bool,
  lines: PropTypes.number
};

export default SourceCodeViewer;
