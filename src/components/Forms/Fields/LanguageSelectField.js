import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import SelectField from './SelectField';

const LanguageSelectField = ({ options = [], ...props }) => (
  <SelectField
    {...props}
    options={[
      { key: 'en', name: 'English' },
      { key: 'cs', name: 'Čeština' },
      { key: 'de', name: 'Deutsh' },
      ...options
    ]} />
);

export default LanguageSelectField;
