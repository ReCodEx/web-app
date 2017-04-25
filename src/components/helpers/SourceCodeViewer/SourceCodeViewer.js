import React, { PropTypes } from 'react';
import { canUseDOM } from 'exenv';
import ClientOnly from '../ClientOnly';

var AceEditor = null;
if (canUseDOM) {
  AceEditor = require('react-ace').default;
  require('brace/theme/monokai');
  require('brace/mode/c_cpp');
  require('brace/mode/java');
  require('brace/mode/csharp');
  require('brace/keybinding/vim');
}

const getMode = ext => {
  switch (ext) {
    case 'java':
      return 'java';

    case 'cs':
      return 'csharp';

    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
      return 'c_cpp';

    default:
      return 'c_cpp';
  }
};

const SourceCodeViewer = (
  {
    name,
    content = '',
    lineNumbers = true,
    lines = 20
  }
) => (
  <ClientOnly>
    <AceEditor
      value={content}
      disabled
      mode={getMode(name.split('.').pop())}
      theme="monokai"
      name="source-code-viewer"
      width="100%"
      editorProps={{ $blockScrolling: true }}
    />
  </ClientOnly>
);

SourceCodeViewer.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string,
  lineNumbers: PropTypes.bool,
  lines: PropTypes.number
};

export default SourceCodeViewer;
