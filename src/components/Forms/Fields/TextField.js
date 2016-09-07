import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

const TextField = ({
  input,
  meta: {
    touched,
    error
  },
  type = 'text',
  label,
  ...props
}) => (
  <FormGroup validationState={touched && error ? 'error' : undefined}>
    <ControlLabel htmlFor={name}>{label}</ControlLabel>
    <FormControl {...input} {...props} type={type} />
    {touched && error && <HelpBlock>{error}</HelpBlock>}
  </FormGroup>
);

TextField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default TextField;
