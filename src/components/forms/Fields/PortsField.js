import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { PortField } from '../Fields';
import { FormattedMessage } from 'react-intl';

const PortsField = ({ label, prefix, ports }) => (
  <div>
    <h4>{label}</h4>
    {ports.length === 0 && (
      <FormattedMessage
        id="app.portsField.empty"
        defaultMessage="There are no ports."
      />
    )}
    {ports.map(({ name, type, value }) => (
      <Field
        key={name}
        name={`${prefix}.${name}.value`}
        component={PortField}
        label={name}
        portType={type}
      />
    ))}
  </div>
);

PortsField.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]).isRequired,
  prefix: PropTypes.string.isRequired,
  ports: PropTypes.array,
};

export default PortsField;
