import React from 'react';
import PropTypes from 'prop-types';
import SelectField from './SelectField';

const LanguageSelectField = ({ options = [], ...props }) => (
  <SelectField
    {...props}
    options={[
      { key: '', name: '...' },
      { key: 'en', name: 'English' },
      { key: 'cs', name: 'Čeština' },
      { key: 'de', name: 'Deutsch' },
      ...options
    ]}
  />
);

LanguageSelectField.propTypes = {
  options: PropTypes.array
};

export default LanguageSelectField;
