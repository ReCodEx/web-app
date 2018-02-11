import React from 'react';
import SelectField from './SelectField';

const languageOptions = [
  { key: 'en', name: 'English' },
  { key: 'cs', name: 'Čeština' }
];

const LanguageSelectField = ({ ...props }) =>
  <SelectField {...props} options={languageOptions} addEmptyOption={true} />;

LanguageSelectField.propTypes = {};

export default LanguageSelectField;
