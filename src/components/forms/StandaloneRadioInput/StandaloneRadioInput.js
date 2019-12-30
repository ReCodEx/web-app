import React from 'react';
import PropTypes from 'prop-types';

const StandaloneRadioInput = ({ name, value, checked, disabled, readOnly }) => {
  return (
    <div className="radio-container">
      <label>
        <input type="radio" name={name} value={value} checked={checked} disabled={disabled} readOnly={readOnly} />
        <span className="radiomark"></span>
      </label>
    </div>
  );
};

StandaloneRadioInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default StandaloneRadioInput;
