import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

class DatetimeField extends Component {

  /**
   * This hack forces redux-form to open the calendar each time
   * the input is focused (it opens every other time otherwise thanks to
   * strict shoudComponentUpdate implementation of redux-form).
   */
  onFocus() {
    const { input: { value, onChange } } = this.props;
    onChange(value);
  }

  render() {
    const {
      input,
      meta: {
        touched,
        visited,
        error
      },
      defaultValue = '',
      label,
      ...props
    } = this.props;

    const {
      lang
    } = this.context;

    return (
      <FormGroup controlId={input.name} validationState={touched && error ? 'error' : undefined}>
        <ControlLabel>{label}</ControlLabel>
        <Datetime {...input} {...props} locale={lang} onFocus={() => this.onFocus()} />
        {touched && error && <HelpBlock>{error}</HelpBlock>}
      </FormGroup>
    );
  }
}

DatetimeField.contextTypes = {
  lang: PropTypes.string
};

DatetimeField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default DatetimeField;
