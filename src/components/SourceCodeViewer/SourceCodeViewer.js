import React, { PropTypes } from 'react';

import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';

const SourceCodeViewer = ({
  name,
  content = '',
  lineNumbers = true
}) => (
  <div style={{
    tabSize: 2
  }}>
    <CodeMirror
      value={content}
      disabled
      className='cm-s-monokai'
      options={{
        lineNumbers,
        mode: name.split('.').pop()
      }} />
  </div>
);

export default SourceCodeViewer;
