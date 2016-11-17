import React, { PropTypes } from 'react';
import { canUseDOM } from 'exenv';

import AceEditor from 'react-ace';
import 'brace/theme/monokai';
import 'brace/mode/c_cpp';
import 'brace/mode/java';
import 'brace/mode/csharp';
import 'brace/keybinding/vim';

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

const SourceCodeViewer = ({
  name,
  content = '',
  lineNumbers = true,
  lines = 20
}) =>
  canUseDOM ? (
    <AceEditor
      value={content}
      disabled
      mode={getMode(name.split('.').pop())}
      theme='monokai'
      name='source-code-viewer'
      width='100%'
      editorProps={{$blockScrolling: true}} />
  ) : null;

SourceCodeViewer.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string,
  lineNumbers: PropTypes.bool,
  lines: PropTypes.number
};

export default SourceCodeViewer;
