import React from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';

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
  { name, content = '', lineNumbers = true },
  { userSettings: { vimMode = false, darkTheme = false } }
) =>
  <AceEditor
    value={content}
    mode={getMode(name.split('.').pop())}
    keyboardHandler={vimMode ? 'vim' : undefined}
    theme={darkTheme ? 'monokai' : 'github'}
    name="source-code-viewer"
    width="100%"
    height="100%"
    editorProps={{ $blockScrolling: true, $autoScrollEditorIntoView: true }}
  />;

SourceCodeViewer.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string,
  lineNumbers: PropTypes.bool
};

SourceCodeViewer.contextTypes = {
  userSettings: PropTypes.object
};

export default SourceCodeViewer;
