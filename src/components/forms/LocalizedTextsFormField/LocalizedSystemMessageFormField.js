import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import InsetPanel from '../../widgets/InsetPanel';
import { MarkdownTextAreaField, CheckboxField } from '../Fields';
import { PREVIEW_INLINE } from '../Fields/MarkdownTextAreaField.js';

const LocalizedSystemMessageFormField = ({ prefix, data: enabled }) => (
  <InsetPanel>
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
      preview={PREVIEW_INLINE}
      disabled={!enabled}
      label={
        <FormattedMessage
          id="app.editLocalizedTextForm.localized.description"
          defaultMessage="Text of system message:"
        />
      }
    />
  </InsetPanel>
);

LocalizedSystemMessageFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
};

export default LocalizedSystemMessageFormField;
