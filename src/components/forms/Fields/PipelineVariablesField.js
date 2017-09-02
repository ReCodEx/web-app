import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { TextField, ExpandingTextField } from '../Fields';
import { FormattedMessage } from 'react-intl';

const isArray = (type = '') => type.indexOf('[]') === type.length - 2;

const PipelineVariablesField = ({ input, label, variables }) =>
  <div>
    <h4>
      {label}
    </h4>
    {variables.length === 0 &&
      <FormattedMessage
        id="app.portsField.empty"
        defaultMessage="There are no ports."
      />}
    {variables.map(({ value, type }) =>
      <Field
        key={value}
        name={`${input.name}.${value}`}
        component={isArray(type) ? ExpandingTextField : TextField}
        label={`${atob(value)}: `}
      />
    )}
  </div>;

PipelineVariablesField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  variables: PropTypes.array
};

export default PipelineVariablesField;
