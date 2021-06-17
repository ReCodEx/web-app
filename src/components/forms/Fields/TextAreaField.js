import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form, FormGroup, FormControl, FormLabel } from 'react-bootstrap';
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
}) => (
  <FormGroup controlId={input.name}>
    {Boolean(label) && (
      <FormLabel className={error ? 'text-danger' : warning ? 'text-warning' : undefined}>{label}</FormLabel>
    )}
    <FormControl
      {...input}
      {...props}
      as="textarea"
      rows={8}
      isInvalid={Boolean(error)}
      className={classnames({
        'form-control': true,
        [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
        [styles.active]: active,
        'border-danger': error,
        'border-warning': !error && warning,
      })}
    />
    {error && <Form.Text className="text-danger"> {error} </Form.Text>}
    {!error && warning && <Form.Text className="text-warning"> {warning} </Form.Text>}
    {children}
  </FormGroup>
);

TextAreaField.propTypes = {
  type: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]),
  children: PropTypes.any,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  ignoreDirty: PropTypes.bool,
};

export default TextAreaField;
