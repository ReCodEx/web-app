import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import classNames from 'classnames';

import withLinks from '../../../helpers/withLinks';

import styles from './commonStyles.less';

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
      meta: { active, dirty, error, warning },
      disabled,
      label,
      ignoreDirty = false,
      ...props
    } = this.props;

    const { lang } = this.context;

    return (
      <FormGroup
        controlId={input.name}
        validationState={error ? 'error' : warning ? 'warning' : undefined}
      >
        <ControlLabel>{label}</ControlLabel>
        <Datetime
          {...input}
          {...props}
          locale={lang}
          onFocus={() => this.onFocus()}
          inputProps={{ disabled }}
          bsClass={classNames({
            'form-control': true,
            [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
            [styles.active]: active
          })}
        />{' '}
        {error &&
          <HelpBlock>
            {' '}{error}{' '}
          </HelpBlock>}
        {!error &&
          warning &&
          <HelpBlock>
            {' '}{warning}{' '}
          </HelpBlock>}
      </FormGroup>
    );
  }
}

DatetimeField.propTypes = {
  lang: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
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
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  disabled: PropTypes.bool,
  ignoreDirty: PropTypes.bool
};

export default withLinks(DatetimeField);
