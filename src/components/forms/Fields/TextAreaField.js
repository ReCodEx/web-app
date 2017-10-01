import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

const TextAreaField = ({
  input,
  meta: { touched, error },
  type = 'text',
  label,
  children,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? (touched ? 'error' : 'warning') : undefined}
  >
    <ControlLabel>
      {label}
    </ControlLabel>
    <FormControl {...input} {...props} componentClass="textarea" rows={8} />
    {error &&
      <HelpBlock>
        {' '}{touched
          ? error
          : <FormattedMessage
              defaultMessage="This field is required."
              id="app.field.isRequired"
            />}{' '}
      </HelpBlock>}
    {children}
  </FormGroup>;

TextAreaField.propTypes = {
  type: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  children: PropTypes.any,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.string, FormattedMessage])
  })
};

export default TextAreaField;
