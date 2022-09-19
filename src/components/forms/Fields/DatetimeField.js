import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { Form, FormGroup, FormLabel, InputGroup } from 'react-bootstrap';
import classnames from 'classnames';

import withLinks from '../../../helpers/withLinks';
import { UserUIDataContext } from '../../../helpers/contexts';

import styles from './commonStyles.less';

class DatetimeField extends Component {
  /**
   * This hack forces redux-form to open the calendar each time
   * the input is focused (it opens every other time otherwise thanks to
   * strict shoudComponentUpdate implementation of redux-form).
   */
  onFocus() {
    const {
      disabled,
      input: { value, onChange },
    } = this.props;
    if (!disabled) {
      onChange(value);
    }
  }

  render() {
    const {
      input,
      meta: { active, dirty, error, warning },
      disabled,
      onlyDate = false,
      label = null,
      ignoreDirty = false,
      append = null,
      prepend = null,
      ...props
    } = this.props;

    return (
      <FormGroup controlId={input.name}>
        {Boolean(label) && (
          <FormLabel className={error ? 'text-danger' : warning ? 'text-warning' : undefined}>{label}</FormLabel>
        )}
        <InputGroup>
          <UserUIDataContext.Consumer>
            {({ dateFormatOverride = null }) => (
              <Datetime
                {...input}
                {...props}
                locale={dateFormatOverride}
                timeFormat={onlyDate ? false : 'H:mm'}
                onFocus={() => this.onFocus()}
                inputProps={{
                  disabled,
                  className: classnames({
                    'form-control': true,
                    [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
                    [styles.active]: active,
                    'border-danger': error,
                    'border-warning': !error && warning,
                  }),
                }}
              />
            )}
          </UserUIDataContext.Consumer>
          {prepend && <InputGroup.Prepend>{prepend}</InputGroup.Prepend>}
          {append && <InputGroup.Append>{append}</InputGroup.Append>}
        </InputGroup>

        {error && <Form.Text className="text-danger">{error}</Form.Text>}
        {!error && warning && <Form.Text className="text-warning">{warning}</Form.Text>}
      </FormGroup>
    );
  }
}

DatetimeField.propTypes = {
  lang: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    onChange: PropTypes.func,
  }).isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  disabled: PropTypes.bool,
  ignoreDirty: PropTypes.bool,
  onlyDate: PropTypes.bool,
  append: PropTypes.element,
  prepend: PropTypes.element,
};

export default withLinks(DatetimeField);
