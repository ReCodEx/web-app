import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { canUseDOM } from 'exenv';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

let CodeMirror = null;

if (canUseDOM) {
  CodeMirror = require('react-codemirror');
  require('codemirror/mode/clike/clike');
  require('codemirror/mode/pascal/pascal');
  require('codemirror/lib/codemirror.css');
  require('codemirror/theme/monokai.css');
}

const getMode = ext => {
  switch (ext) {
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
    case 'java':
    case 'cs':
      return 'clike';

    default:
      return 'clike';
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
    {CodeMirror && <CodeMirror {...input} options={{ lineNumbers: true, mode: getMode(mode), theme: 'monokai', tabIndex }} />}
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
