import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock,
  Label
} from 'react-bootstrap';

import { isArrayType } from '../../../helpers/boxes';

const getLabelStyle = portType => (isArrayType(portType) ? 'primary' : 'info');

const PortField = ({
  input,
  meta: { touched, error },
  label,
  portType,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? (touched ? 'error' : 'warning') : undefined}
  >
    <ControlLabel>
      {label}{' '}
      <Label
        style={{ fontFamily: 'monospace' }}
        bsStyle={getLabelStyle(portType)}
      >
        {portType}
      </Label>
    </ControlLabel>
    <FormControl {...input} {...props} type="text" />
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

PortField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.any
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  portType: PropTypes.string.isRequired
};

export default PortField;
