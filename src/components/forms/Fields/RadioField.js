import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, FormCheck } from 'react-bootstrap';
import classnames from 'classnames';

const RadioField = ({ input, meta: { error, warning, dirty }, ignoreDirty = false, options }) => (
  <FormGroup controlId={input.name}>
    {options.map(({ key, name }, idx) => (
      <FormCheck type="radio" className="radio-container" key={`radio${idx}-${key}`}>
        <label
          className={classnames({
            'form-check-label': true,
            'text-danger': error && input.value === key,
            'text-warninig': !error && warning && input.value === key,
            'text-primary': dirty && !ignoreDirty && input.value === key,
          })}>
          <input type="radio" name={input.name} value={key} checked={input.value === key} onChange={input.onChange} />
          {name}
          <span className="radiomark"></span>
        </label>
      </FormCheck>
    ))}

    {error && <Form.Text className="text-danger"> {error} </Form.Text>}
    {!error && warning && <Form.Text className="text-warning"> {warning} </Form.Text>}
  </FormGroup>
);

RadioField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    onChange: PropTypes.func,
  }).isRequired,
  meta: PropTypes.shape({
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  options: PropTypes.array.isRequired,
  ignoreDirty: PropTypes.bool,
};

export default RadioField;
