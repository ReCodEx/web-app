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

import { isArrayType, isUnknownType } from '../../../helpers/boxes';

const getLabelStyle = portType =>
  isArrayType(portType)
    ? 'primary'
    : isUnknownType(portType) ? 'default' : 'info';

const PortField = ({
  input,
  meta: { touched, error },
  type = 'text',
  label,
  portType,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={touched && error ? 'error' : undefined}
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
    <FormControl {...input} {...props} type={type} />
    {touched &&
      error &&
      <HelpBlock>
        {error}
      </HelpBlock>}
  </FormGroup>;

PortField.propTypes = {
  type: PropTypes.string,
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
