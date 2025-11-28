import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, FormControl, FormLabel, InputGroup } from 'react-bootstrap';
import classnames from 'classnames';

import * as styles from './commonStyles.less';

const TextField = ({
  input: { value, ...input },
  meta: { active, dirty, error = null, warning = null, ...restMeta },
  type = 'text',
  label = null,
  groupClassName = '',
  ignoreDirty = false,
  append = null,
  prepend = null,
  className = '',
  ...props
}) => (
  <FormGroup controlId={input.name} className={`mb-3 ${groupClassName}`}>
    {Boolean(label) && <FormLabel>{label}</FormLabel>}
    <InputGroup>
      {prepend || null}
      <FormControl
        {...input}
        {...props}
        isInvalid={Boolean(error)}
        type={type}
        value={Array.isArray(value) ? value[0] : value}
        className={
          classnames({
            'form-control': true,
            [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
            [styles.active]: active,
            'text-danger': error,
            'border-warning': !error && warning,
          }) +
          ' ' +
          (className || '')
        }
      />
      {append || null}
    </InputGroup>
    {error && <Form.Text className="text-danger"> {error} </Form.Text>}
    {!error && warning && <Form.Text className="text-warning"> {warning} </Form.Text>}
  </FormGroup>
);

TextField.propTypes = {
  type: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  groupClassName: PropTypes.string,
  ignoreDirty: PropTypes.bool,
  append: PropTypes.element,
  prepend: PropTypes.element,
  className: PropTypes.string,
};

export default TextField;
