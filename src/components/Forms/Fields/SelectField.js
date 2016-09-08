import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

const SelectField = ({
  input,
  meta: {
    touched,
    error
  },
  label,
  options,
  ...props
}) => (
  <FormGroup validationState={touched && error ? 'error' : undefined}>
    <ControlLabel htmlFor={name}>{label}</ControlLabel>
    <FormControl {...input} {...props} componentClass='select'>
      {options.map(({ key, name }) =>
        <option value={key} key={key}>{name}</option>
      )}
    </FormControl>
    {touched && error && <HelpBlock>{error}</HelpBlock>}
  </FormGroup>
);

SelectField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default SelectField;
