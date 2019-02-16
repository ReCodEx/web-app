import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import isNumeric from 'validator/lib/isNumeric';

import TextField from './TextField';

class NumericTextField extends Component {
  format = value => {
    if (value === null) {
      return '';
    }
    return String(value);
  };

  parse = value => {
    if (value.trim() === '') {
      return this.props.nullable ? null : value;
    }
    const num = Number(value);
    return isNaN(num) ? value : num;
  };

  validate = value => {
    const { validateMin = null, validateMax = null, nullable = false } = this.props;
    if (value === null && nullable) {
      return undefined;
    }

    if (typeof value === 'undefined' || (typeof value !== 'number' && !isNumeric(value))) {
      return (
        <FormattedMessage id="app.numericTextField.validationFailed" defaultMessage="The value must be a number." />
      );
    }

    if ((validateMin !== null && validateMin > value) || (validateMax !== null && value > validateMax)) {
      return validateMin !== null && validateMax !== null ? (
        <FormattedMessage
          id="app.numericTextField.validationFailedMinMax"
          defaultMessage="The value must be in between {validateMin} and {validateMax}."
          values={{ validateMin, validateMax }}
        />
      ) : validateMin !== null ? (
        <FormattedMessage
          id="app.numericTextField.validationFailedMin"
          defaultMessage="The value must not be lesser than {validateMin}."
          values={{ validateMin }}
        />
      ) : (
        <FormattedMessage
          id="app.numericTextField.validationFailedMax"
          defaultMessage="The value must not be greater than {validateMax}."
          values={{ validateMax }}
        />
      );
    }

    return undefined;
  };

  render() {
    const { name, maxLength = 11, validateMin = null, validateMax = null, nullable, ...props } = this.props;
    return (
      <Field
        name={name}
        component={TextField}
        format={this.format}
        parse={this.parse}
        maxLength={maxLength}
        validate={validateMin !== null && validateMax !== null ? this.validate : undefined}
        {...props}
      />
    );
  }
}

NumericTextField.propTypes = {
  name: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  validateMin: PropTypes.number,
  validateMax: PropTypes.number,
  nullable: PropTypes.bool,
};

export default NumericTextField;
