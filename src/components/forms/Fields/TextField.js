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
  input: { value, ...input },
  meta: { touched, dirty, error },
  type = 'text',
  label,
  groupClassName = '',
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? 'error' : dirty ? 'warning' : undefined}
    className={groupClassName}
  >
    <ControlLabel>
      {label}
    </ControlLabel>
    <FormControl
      {...input}
      {...props}
      type={type}
      value={
        typeof value === 'string' || typeof value === 'number'
          ? value
          : value[0]
      }
    />
    {error &&
      <HelpBlock>
        {' '}{error}{' '}
      </HelpBlock>}
  </FormGroup>;

TextField.propTypes = {
  type: PropTypes.string,
  input: PropTypes.shape({
    value: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.string,
      PropTypes.number
    ]).isRequired
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  groupClassName: PropTypes.string
};

export default TextField;
