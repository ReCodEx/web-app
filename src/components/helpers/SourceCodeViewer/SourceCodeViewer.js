import React from 'react';
import PropTypes from 'prop-types';

import { UserSettingsContext } from '../../../helpers/contexts';
import { loadAceEditor, getAceModeFromExtension } from '../../helpers/AceEditorLoader';
let AceEditor = loadAceEditor();

const SourceCodeViewer = ({ name, content = '', lineNumbers = true }) => (
  <UserSettingsContext.Consumer>
    {({ vimMode = false, darkTheme = false }) => (
      <AceEditor
        value={content}
        mode={getAceModeFromExtension(name.split('.').pop())}
        keyboardHandler={vimMode ? 'vim' : undefined}
        theme={darkTheme ? 'monokai' : 'github'}
        name="source-code-viewer"
        width="100%"
        height="100%"
        editorProps={{ $blockScrolling: true, $autoScrollEditorIntoView: true }}
      />
    )}
  </UserSettingsContext.Consumer>
);

SourceCodeViewer.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string,
  lineNumbers: PropTypes.bool,
};

export default SourceCodeViewer;
