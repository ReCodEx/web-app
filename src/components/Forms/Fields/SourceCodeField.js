import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { canUseDOM } from 'exenv';

import {
  FormGroup,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

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
}) => (
  <FormGroup
    controlId={name}
    validationState={touched && error ? 'error' : undefined}>
    <ControlLabel>{label}</ControlLabel>
    {canUseDOM && (
      <AceEditor
        {...input}
        mode={getMode(mode)}
        theme='monokai'
        name={input.id}
        tabIndex={tabIndex}
        keyboardHandler='vim'
        width='100%'
        editorProps={{$blockScrolling: true}} />)}
    {touched && error && <HelpBlock>{error}</HelpBlock>}
    {children}
  </FormGroup>
);

SourceCodeField.propTypes = {
  mode: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default SourceCodeField;
