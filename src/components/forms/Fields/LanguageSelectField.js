import React from 'react';
import SelectField from './SelectField';
import { objectMap } from '../../../helpers/common';
import { knownLocalesNames } from '../../../helpers/localizedData';

const languageOptions = Object.values(
  objectMap(knownLocalesNames, (name, key) => ({ key, name }))
);

const LanguageSelectField = ({ ...props }) => (
  <SelectField {...props} options={languageOptions} addEmptyOption={true} />
);

LanguageSelectField.propTypes = {};

export default LanguageSelectField;
