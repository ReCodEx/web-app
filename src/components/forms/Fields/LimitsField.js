import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { BytesTextField, SecondsTextField, TextField } from '../Fields';
import { FormattedMessage } from 'react-intl';

const LimitsField = ({ label, prefix, ...props }) =>
  <div>
    <Field
      name={`${prefix}.memory`}
      component={BytesTextField}
      label={
        <FormattedMessage
          id="app.fields.limits.memory"
          defaultMessage="Test memory limit:"
        />
      }
      {...props}
    />
    <Field
      name={`${prefix}.wall-time`}
      component={SecondsTextField}
      label={
        <FormattedMessage
          id="app.fields.limits.time"
          defaultMessage="Test time limit:"
        />
      }
      {...props}
    />
    <Field
      name={`${prefix}.parallel`}
      component={TextField}
      label={
        <FormattedMessage
          id="app.fields.limits.parallel"
          defaultMessage="Number of parallel processes:"
        />
      }
      {...props}
    />
  </div>;

LimitsField.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  prefix: PropTypes.string.isRequired,
  ports: PropTypes.array
};

export default LimitsField;
