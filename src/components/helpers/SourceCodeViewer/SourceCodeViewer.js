import React from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { UserSettingsContext } from '../../../helpers/contexts';
import { getAceModeFromExtension } from '../../helpers/ace';

const AceEditor = canUseDOM ? require('react-ace').default : null;

const SourceCodeViewer = ({ name, content = '' }) =>
  canUseDOM ? (
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
          fontSize={16}
          editorProps={{ $blockScrolling: true, $autoScrollEditorIntoView: true }}
        />
      )}
    </UserSettingsContext.Consumer>
  ) : (
    <></>
  );

SourceCodeViewer.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string,
};

export default SourceCodeViewer;
