import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, FormControl, FormLabel } from 'react-bootstrap';
import classnames from 'classnames';

import styles from './commonStyles.less';

const SelectField = ({
  input,
  meta: { active, dirty, warning, error },
  label = null,
  options,
  addEmptyOption = false,
  emptyOptionCaption = '...',
  ignoreDirty = false,
  associatedButton = null,
  ...props
}) => (
  <FormGroup controlId={input.name}>
    {Boolean(label) && (
      <FormLabel className={error ? 'text-danger' : warning ? 'text-warning' : undefined}>{label}</FormLabel>
    )}

    <table className="full-width">
      <tbody>
        <tr>
          <td className="full-width valign-top">
            <FormControl
              {...input}
              {...props}
              as="select"
              isInvalid={Boolean(error)}
              className={classnames({
                'form-control': true,
                'full-width': true,
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
            </FormControl>
          </td>
          {associatedButton && <td className="valign-top">{associatedButton}</td>}
        </tr>
      </tbody>
    </table>

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
  options: PropTypes.array.isRequired,
  addEmptyOption: PropTypes.bool,
  emptyOptionCaption: PropTypes.string,
  associatedButton: PropTypes.any,
  ignoreDirty: PropTypes.bool,
};

export default SelectField;
