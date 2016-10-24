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
  require('codemirror/lib/codemirror.css');
  require('codemirror/theme/monokai.css');
}

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
  ...props
}) => (
  <FormGroup
    controlId={name}
    validationState={touched && error ? 'error' : undefined}>
    <ControlLabel>{label}</ControlLabel>
    {CodeMirror && <CodeMirror {...input} options={{ lineNumbers: true, mode, theme: 'monokai' }} />}
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
