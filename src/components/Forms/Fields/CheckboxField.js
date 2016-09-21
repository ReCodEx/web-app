import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

import Checkbox from '../Checkbox';

const CheckboxField = ({
  input,
  meta: {
    touched,
    error
  },
  label,
  ...props
}) => (
  <FormGroup validationState={touched && error ? 'error' : undefined}>
    <Checkbox {...props} {...input} controlId={input.name} checked={input.value}>
      {label}
    </Checkbox>
    {touched && error && <HelpBlock>{error}</HelpBlock>}
  </FormGroup>
);

CheckboxField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default CheckboxField;
