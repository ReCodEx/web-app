import React, { PropTypes } from 'react';
import { CanUseDOM } from 'exenv';

if (CanUseDOM) {
  var CodeMirror = require('react-codemirror');
  require('codemirror/lib/codemirror.css');
  require('codemirror/theme/monokai.css');
}

const SourceCodeViewer = ({
  name,
  content = '',
  lineNumbers = true
}) =>
  CodeMirror
    ? (
      <CodeMirror
        value={content}
        disabled
        options={{
          lineNumbers,
          mode: name.split('.').pop()
        }} />
    )
  : null;

export default SourceCodeViewer;
