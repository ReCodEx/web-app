import React from 'react';
import SelectField from './SelectField.js';
import { objectMap } from '../../../helpers/common.js';
import { knownLocalesNames } from '../../../helpers/localizedData.js';

const languageOptions = Object.values(objectMap(knownLocalesNames, (name, key) => ({ key, name })));

const LanguageSelectField = ({ ...props }) => (
  <SelectField {...props} options={languageOptions} addEmptyOption={true} />
);

LanguageSelectField.propTypes = {};

export default LanguageSelectField;
