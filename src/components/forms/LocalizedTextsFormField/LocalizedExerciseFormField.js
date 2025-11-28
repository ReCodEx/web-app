import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import SharedLocalizedFields from './SharedLocalizedFields.js';
import SharedExerciseAssignmentLocalizedFields from './SharedExerciseAssignmentLocalizedFields.js';
import { MarkdownTextAreaField } from '../Fields';
import InsetPanel from '../../widgets/InsetPanel';

const LocalizedExerciseFormField = ({ prefix, data: enabled, previewPreprocessor, ignoreDirty = false }) => (
  <InsetPanel>
    <SharedLocalizedFields prefix={prefix} enabled={enabled} ignoreDirty={ignoreDirty} />
    <SharedExerciseAssignmentLocalizedFields
      prefix={prefix}
      enabled={enabled}
      previewPreprocessor={previewPreprocessor}
    />

    <Field
      name={`${prefix}.description`}
      component={MarkdownTextAreaField}
      previewPreprocessor={previewPreprocessor}
      disabled={!enabled}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.description"
          defaultMessage="Short description (visible only to supervisors):"
        />
      }
    />
  </InsetPanel>
);

LocalizedExerciseFormField.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
  ignoreDirty: PropTypes.bool,
  previewPreprocessor: PropTypes.func,
};

export default LocalizedExerciseFormField;
