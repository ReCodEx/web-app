import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, HelpBlock, Radio } from 'react-bootstrap';

const RadioField = ({ input, meta: { error, warning }, options }) => {
  return (
    <FormGroup
      validationState={error ? 'error' : warning ? 'warning' : undefined}
      controlId={input.name}
    >
      {options.map(({ key, name }, idx) =>
        <Radio
          key={`radio${idx}-${key}`}
          name={input.name}
          value={key}
          checked={input.value === key}
          onChange={input.onChange}
        >
          {name}
        </Radio>
      )}

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
};

RadioField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
  }).isRequired,
  meta: PropTypes.shape({
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  options: PropTypes.array.isRequired
};

export default RadioField;
