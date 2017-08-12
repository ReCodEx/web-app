import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { TextField } from '../Fields';
import { FormattedMessage } from 'react-intl';

const PortsField = ({ label, prefix, ports }) =>
  <div>
    <h4>
      {label}
    </h4>
    {ports.length === 0 &&
      <FormattedMessage
        id="app.portsField.empty"
        defaultMessage="There are no ports."
      />}
    {ports.map(({ name, type, value }) =>
      <Field
        key={name}
        name={`${prefix}.${name}.value`}
        component={TextField}
        defaultValue={name}
        label={`${name}${type ? `(${type}):` : ''}`}
      />
    )}
  </div>;

PortsField.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  prefix: PropTypes.string.isRequired,
  ports: PropTypes.array
};

export default PortsField;
