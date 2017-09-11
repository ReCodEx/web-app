import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { BytesTextField, SecondsTextField } from '../Fields';
import { FormattedMessage } from 'react-intl';

const LimitsField = ({ label, prefix }) =>
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
