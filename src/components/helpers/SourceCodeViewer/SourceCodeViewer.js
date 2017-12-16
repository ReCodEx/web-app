import React from 'react';
import PropTypes from 'prop-types';

import {
  loadAceEditor,
  getAceModeFromExtension
} from '../../helpers/AceEditorLoader';
let AceEditor = loadAceEditor();

const SourceCodeViewer = (
  { name, content = '', lineNumbers = true },
  { userSettings: { vimMode = false, darkTheme = false } }
) =>
  <AceEditor
    value={content}
    mode={getAceModeFromExtension(name.split('.').pop())}
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
