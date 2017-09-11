import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { BytesTextField, SecondsTextField } from '../Fields';
import { FormattedMessage } from 'react-intl';

const LimitsField = ({ test, label, prefix, ...props }) =>
  <div>
    <h4>
      {test}
    </h4>
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
      name={`${prefix}.time`}
      component={SecondsTextField}
      label={
        <FormattedMessage
          id="app.fields.limits.time"
          defaultMessage="Test time limit:"
        />
      }
      {...props}
    />
  </div>;

LimitsField.propTypes = {
  test: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  prefix: PropTypes.string.isRequired,
  ports: PropTypes.array
};

export default LimitsField;
