import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, FormSelect, FormLabel, InputGroup } from 'react-bootstrap';
import classnames from 'classnames';

import * as styles from './commonStyles.less';

const SelectField = ({
  input,
  meta: { active, dirty, warning, error },
  label = null,
  groupClassName = '',
  options,
  addEmptyOption = false,
  emptyOptionCaption = '...',
  ignoreDirty = false,
  append = null,
  prepend = null,
  ...props
}) => (
  <FormGroup controlId={input.name} className={groupClassName}>
    {Boolean(label) && (
      <FormLabel className={error ? 'text-danger' : warning ? 'text-warning' : undefined}>{label}</FormLabel>
    )}
    <InputGroup>
      {prepend || null}
      <FormSelect
        {...input}
        {...props}
        isInvalid={Boolean(error)}
        className={classnames({
          'form-control': true,
          'w-100': true,
          [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
          [styles.active]: active,
          'border-danger': error,
          'border-warning': !error && warning,
        })}>
        {addEmptyOption && (
          <option value={''} key={'-1'}>
            {emptyOptionCaption}
          </option>
        )}
        {options.map(({ key, name }, i) => (
          <option value={key} key={i}>
            {name}
          </option>
        ))}
      </FormSelect>
      {append || null}
    </InputGroup>

    {error && <Form.Text className="text-danger"> {error} </Form.Text>}
    {!error && warning && <Form.Text className="text-warning"> {warning} </Form.Text>}
  </FormGroup>
);

SelectField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  groupClassName: PropTypes.string,
  options: PropTypes.array.isRequired,
  addEmptyOption: PropTypes.bool,
  emptyOptionCaption: PropTypes.string,
  append: PropTypes.element,
  prepend: PropTypes.element,
  ignoreDirty: PropTypes.bool,
};

export default SelectField;
