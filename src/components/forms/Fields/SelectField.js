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
  meta: { touched, dirty, error },
  label,
  options,
  addEmptyOption = false,
  emptyOptionCaption = '...',
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? 'error' : dirty ? 'warning' : undefined}
  >
    <ControlLabel>
      {label}
    </ControlLabel>
    <FormControl {...input} {...props} componentClass="select">
      {addEmptyOption &&
        <option value={''} key={'-1'}>
          {emptyOptionCaption}
        </option>}
      {options.map(({ key, name }, i) =>
        <option value={key} key={i}>
          {name}
        </option>
      )}
    </FormControl>
    {error &&
      <HelpBlock>
        {' '}{error}{' '}
      </HelpBlock>}
  </FormGroup>;

SelectField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.any,
    dirty: PropTypes.bool,
    touched: PropTypes.bool
  }),
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  options: PropTypes.array.isRequired,
  addEmptyOption: PropTypes.bool,
  emptyOptionCaption: PropTypes.string
};

export default SelectField;
