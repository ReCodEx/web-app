import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';
import classNames from 'classnames';

import styles from './commonStyles.less';

const TextAreaField = ({
  input,
  meta: { active, dirty, error, warning },
  type = 'text',
  label,
  children,
  ignoreDirty = false,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? 'error' : warning ? 'warning' : undefined}
  >
    <ControlLabel>
      {label}
    </ControlLabel>
    <FormControl
      {...input}
      {...props}
      componentClass="textarea"
      rows={8}
      bsClass={classNames({
        'form-control': true,
        [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
        [styles.active]: active
      })}
    />
    {error &&
      <HelpBlock>
        {' '}{error}{' '}
      </HelpBlock>}
    {!error &&
      warning &&
      <HelpBlock>
        {' '}{warning}{' '}
      </HelpBlock>}
    {children}
  </FormGroup>;

TextAreaField.propTypes = {
  type: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  children: PropTypes.any,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  ignoreDirty: PropTypes.bool
};

export default TextAreaField;
