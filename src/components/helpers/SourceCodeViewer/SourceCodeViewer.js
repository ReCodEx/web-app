import React from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { UserUIDataContext } from '../../../helpers/contexts';
import { getAceModeFromExtension } from '../../helpers/ace';

const AceEditor = canUseDOM ? require('react-ace').default : null;

const SourceCodeViewer = ({ name, content = '' }) =>
  canUseDOM ? (
    <UserUIDataContext.Consumer>
      {({ vimMode = false, darkTheme = true }) => (
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
    </UserUIDataContext.Consumer>
  ) : (
    <></>
  );

SourceCodeViewer.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string,
};

export default SourceCodeViewer;
