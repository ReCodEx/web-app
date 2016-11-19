import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { canUseDOM } from 'exenv';

import {
  FormGroup,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

// load the ACE editor only when rendering in the browser
let AceEditor = null;
if (canUseDOM) {
  AceEditor = require('react-ace').default;
  require('brace/theme/monokai');
  require('brace/mode/c_cpp');
  require('brace/mode/java');
  require('brace/mode/csharp');
  require('brace/keybinding/vim');
}

import ClientOnly from '../../ClientOnly';

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

const SourceCodeField = ({
  input,
  mode,
  meta: {
    touched,
    error
  },
  type = 'text',
  label,
  children,
  tabIndex,
  ...props
}, {
  userSettings: {
    vimMode = false,
    darkTheme = false
  }
}) => (
  <FormGroup
    controlId={name}
    validationState={touched && error ? 'error' : undefined}>
    <ControlLabel>{label}</ControlLabel>
    <ClientOnly>
      <AceEditor
        {...input}
        mode={getMode(mode)}
        theme='monokai'
        name={input.id}
        tabIndex={tabIndex}
        keyboardHandler='vim'
        width='100%'
        editorProps={{$blockScrolling: true}} />
    </ClientOnly>
    {touched && error && <HelpBlock>{error}</HelpBlock>}
    {children}
  </FormGroup>
);

SourceCodeField.propTypes = {
  input: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  children: PropTypes.any,
  meta: PropTypes.shape({ error: PropTypes.string, touched: PropTypes.bool }),
  tabIndex: PropTypes.number,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

SourceCodeField.contextTypes = {
  userSettings: PropTypes.object
};

export default SourceCodeField;
