import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'react-bootstrap';
import NiceCheckbox from '../NiceCheckbox';

const SimpleCheckboxField = ({ input, meta: { dirty, error, warning }, ignoreDirty = false, ...props }) => {
  return (
    <FormGroup controlId={input.name} className="m-0">
      <NiceCheckbox
        {...props}
        {...input}
        error={error}
        warning={warning}
        checked={Boolean(input.value)}
        dirty={dirty && !ignoreDirty}
      />
    </FormGroup>
  );
};

SimpleCheckboxField.propTypes = {
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
  type: PropTypes.string,
  ignoreDirty: PropTypes.bool,
};

export default SimpleCheckboxField;
