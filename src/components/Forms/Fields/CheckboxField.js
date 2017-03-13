import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  HelpBlock,
  Checkbox
} from 'react-bootstrap';

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
    <FormGroup
        validationState={touched && error ? 'error' : undefined}
        controlId={input.name}>
      <Component
        {...props}
        {...input}
        checked={input.value}>
        {label}
      </Component>
      {touched && error && <HelpBlock>{error}</HelpBlock>}
    </FormGroup>
  );
};

CheckboxField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.bool
  }).isRequired,
  meta: PropTypes.object.isRequired,
  type: PropTypes.string,
  onOff: PropTypes.bool,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default CheckboxField;
