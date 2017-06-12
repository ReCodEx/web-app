import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

const TextField = ({
  input,
  meta: { touched, error },
  type = 'text',
  label,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={touched && error ? 'error' : undefined}
  >
    <ControlLabel>{label}</ControlLabel>
    <FormControl {...input} {...props} type={type} />
    {touched && error && <HelpBlock>{error}</HelpBlock>}
  </FormGroup>;

TextField.propTypes = {
  type: PropTypes.string,
  input: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.any
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default TextField;
