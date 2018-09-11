import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';
import classnames from 'classnames';

import styles from './commonStyles.less';

const TextAreaField = ({
  input,
  meta: { active, dirty, error, warning },
  type = 'text',
  label = null,
  children,
  ignoreDirty = false,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? 'error' : warning ? 'warning' : undefined}
  >
    {Boolean(label) &&
      <ControlLabel>
        {label}
      </ControlLabel>}
    <FormControl
      {...input}
      {...props}
      componentClass="textarea"
      rows={8}
      bsClass={classnames({
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
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]),
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
