import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'react-bootstrap';

import OnOffCheckbox from '../OnOffCheckbox';
import NiceCheckbox from '../NiceCheckbox';

const CheckboxField = ({
  input,
  onOff = false,
  meta: { dirty, error, warning },
  ignoreDirty = false,
  label,
  ...props
}) => {
  const Component = onOff ? OnOffCheckbox : NiceCheckbox;
  /* eslint-disable no-unneeded-ternary */
  return (
    <FormGroup
      className={error ? 'text-danger' : warning ? 'text-warning' : dirty && !ignoreDirty ? 'text-primary' : undefined}
      controlId={input.name}>
      <Component
        {...props}
        {...input}
        type="checkbox"
        checked={Boolean(input.value)}
        error={error}
        warning={warning}
        dirty={dirty && !ignoreDirty}>
        {label}
      </Component>
    </FormGroup>
  );
};

CheckboxField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
  meta: PropTypes.shape({
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  type: PropTypes.string,
  onOff: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  ignoreDirty: PropTypes.bool,
};

export default CheckboxField;
