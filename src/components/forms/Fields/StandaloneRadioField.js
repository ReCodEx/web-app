import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

const StandaloneRadioField = ({ name, value }) => {
  return (
    <div className={'radio-container'}>
      <label>
        <Field name={name} component="input" type="radio" value={value} />
        <span className={'radiomark'}></span>
      </label>
    </div>
  );
};

StandaloneRadioField.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default StandaloneRadioField;
