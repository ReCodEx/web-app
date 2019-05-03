import React from 'react';
import PropTypes from 'prop-types';
import { Well } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import { MarkdownTextAreaField, CheckboxField } from '../Fields';

const LocalizedSystemMessageFormField = ({ prefix, data: enabled }) => (
  <Well>
    <Field
      name={`${prefix}._enabled`}
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editLocalizedTextForm.localeEnabledCheckbox"
          defaultMessage="Enable this localization"
        />
      }
    />

    <Field
      name={`${prefix}.text`}
      component={MarkdownTextAreaField}
      disabled={!enabled}
      label={
        <FormattedMessage
          id="app.editLocalizedTextForm.localized.description"
          defaultMessage="Text of system message:"
        />
      }
    />
  </Well>
);

LocalizedSystemMessageFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
};

export default LocalizedSystemMessageFormField;
