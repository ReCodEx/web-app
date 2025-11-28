import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import SharedLocalizedFields from './SharedLocalizedFields.js';
import SharedExerciseAssignmentLocalizedFields from './SharedExerciseAssignmentLocalizedFields.js';
import { MarkdownTextAreaField } from '../Fields';
import Explanation from '../../widgets/Explanation';
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
        <>
          <FormattedMessage
            id="app.editAssignmentForm.localized.description"
            defaultMessage="Short description for supervisors:"
          />
          <Explanation id="exercise-description-explanation">
            <FormattedMessage
              id="app.editAssignmentForm.localized.descriptionExplanation"
              defaultMessage="This descriptions is visible only to supervisors and should briefly summarize the exercise. You can use exercise file link keys in the text (%%link-key%%) which will be replaced with proper URLs for file downloads in after Markdown rendering."
            />
          </Explanation>
        </>
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
