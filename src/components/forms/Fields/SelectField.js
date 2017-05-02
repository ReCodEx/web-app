import React from 'react';
import PropTypes from 'prop-types';
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
  <FormGroup
    controlId={input.name}
    validationState={touched && error ? 'error' : undefined}>
    <ControlLabel>{label}</ControlLabel>
    <FormControl {...input} {...props} componentClass="select">
      {options.map(({ key, name }) =>
        <option value={key} key={key}>{name}</option>
      )}
    </FormControl>
    {touched && error && <HelpBlock>{error}</HelpBlock>}
  </FormGroup>
);

SelectField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  meta: PropTypes.shape({ error: PropTypes.any, touched: PropTypes.bool }),
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  options: PropTypes.array.isRequired
};

export default SelectField;
