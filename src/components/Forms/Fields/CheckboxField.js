import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

import Checkbox from '../Checkbox';
import OnOffCheckbox from '../OnOffCheckbox';

const CheckboxField = ({
  input,
  onOff = false,
  meta: {
    touched,
    error
  },
  label,
  ...props
}) => {
  const Component = onOff ? OnOffCheckbox : Checkbox;
  return (
    <FormGroup validationState={touched && error ? 'error' : undefined}>
      <Component {...props} {...input} controlId={input.name} checked={input.value}>
        {label}
      </Component>
      {touched && error && <HelpBlock>{error}</HelpBlock>}
    </FormGroup>
  );
};

CheckboxField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default CheckboxField;
