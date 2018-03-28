import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

const SingleUploadField = ({
  input,
  meta: { touched, error },
  label,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? (touched ? 'error' : 'warning') : undefined}
  >
    <ControlLabel>
      {label}
    </ControlLabel>
    <FormControl {...input} {...props} type="upload" />
    {error &&
      <HelpBlock>
        {' '}{touched
          ? error
          : <FormattedMessage
              defaultMessage="This field is required."
              id="app.field.isRequired"
            />}{' '}
      </HelpBlock>}
  </FormGroup>;

SingleUploadField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  meta: PropTypes.shape({ error: PropTypes.string, touched: PropTypes.bool }),
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default SingleUploadField;
