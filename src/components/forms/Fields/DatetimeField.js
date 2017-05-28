import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';

import withLinks from '../../../hoc/withLinks';

class DatetimeField extends Component {
  /**
   * This hack forces redux-form to open the calendar each time
   * the input is focused (it opens every other time otherwise thanks to
   * strict shoudComponentUpdate implementation of redux-form).
   */
  onFocus() {
    const { disabled, input: { value, onChange } } = this.props;
    if (!disabled) {
      onChange(value);
    }
  }

  render() {
    const {
      input,
      meta: { touched, error },
      disabled,
      label,
      ...props
    } = this.props;

    const { lang } = this.context;

    return (
      <FormGroup
        controlId={input.name}
        validationState={touched && error ? 'error' : undefined}
      >
        <ControlLabel>{label}</ControlLabel>
        <Datetime
          {...input}
          {...props}
          locale={lang}
          utc={true}
          onFocus={() => this.onFocus()}
          inputProps={{ disabled }}
        />
        {touched && error && <HelpBlock>{error}</HelpBlock>}
      </FormGroup>
    );
  }
}

DatetimeField.propTypes = {
  lang: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object
    ])
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.any
  }).isRequired,
  disabled: PropTypes.bool
};

export default withLinks(DatetimeField);
