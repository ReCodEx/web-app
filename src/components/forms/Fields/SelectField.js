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
  meta: { touched, error },
  label,
  options,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? (touched ? 'error' : 'warning') : undefined}
  >
    <ControlLabel>
      {label}
    </ControlLabel>
    <FormControl {...input} {...props} componentClass="select">
      {options.map(({ key, name }, i) =>
        <option value={key} key={i}>
          {name}
        </option>
      )}
    </FormControl>
    {error &&
      <HelpBlock>
        {touched
          ? error
          : <FormattedMessage
              defaultMessage="This field is required."
              id="app.field.isRequired"
            />}
      </HelpBlock>}
  </FormGroup>;

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
