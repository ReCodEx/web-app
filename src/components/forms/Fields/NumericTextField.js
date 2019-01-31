import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import isNumeric from 'validator/lib/isNumeric';

import TextField from './TextField';

const parseNumber = value => {
  const num = Number(value);
  return isNaN(num) || value === '' ? value : num;
};

class NumericTextField extends Component {
  validate = value => {
    const { validateMin = null, validateMax = null } = this.props;
    if (
      typeof value === 'undefined' ||
      (typeof value !== 'number' && !isNumeric(value))
    ) {
      return (
        <FormattedMessage
          id="app.numericTextField.validationFailed"
          defaultMessage="The value must be a number."
        />
      );
    }
    if (
      (validateMin !== null && validateMin > value) ||
      (validateMax !== null && value > validateMax)
    ) {
      return validateMin !== null && validateMax !== null
        ? <FormattedMessage
            id="app.numericTextField.validationFailedMinMax"
            defaultMessage="The value must be in between {validateMin} and {validateMax}."
            values={{ validateMin, validateMax }}
          />
        : validateMin !== null
          ? <FormattedMessage
              id="app.numericTextField.validationFailedMin"
              defaultMessage="The value must not be lesser than {validateMin}."
              values={{ validateMin }}
            />
          : <FormattedMessage
              id="app.numericTextField.validationFailedMax"
              defaultMessage="The value must not be greater than {validateMax}."
              values={{ validateMax }}
            />;
    } else {
      return undefined;
    }
  };

  render() {
    const {
      name,
      maxLength = 11,
      validateMin = null,
      validateMax = null,
      ...props
    } = this.props;
    return (
      <Field
        name={name}
        component={TextField}
        parse={parseNumber}
        maxLength={maxLength}
        validate={
          validateMin !== null && validateMax !== null
            ? this.validate
            : undefined
        }
        {...props}
      />
    );
  }
}

NumericTextField.propTypes = {
  name: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  validateMin: PropTypes.number,
  validateMax: PropTypes.number
};

export default NumericTextField;
