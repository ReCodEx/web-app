import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import { TextField, MarkdownTextAreaField } from '../Fields';
import { PREVIEW_FIRST } from '../Fields/MarkdownTextAreaField.js';
import Explanation from '../../widgets/Explanation';

const isURL = url => {
  const pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return url && url.trim() !== '' && !pattern.test(url.trim()) ? (
    <FormattedMessage
      id="app.editAssignmentForm.localized.urlValidation"
      defaultMessage="Given string is not a valid URL."
    />
  ) : null;
};

const SharedExerciseAssignmentLocalizedFields = ({ prefix, enabled, previewPreprocessor }) => (
  <>
    <Field
      name={`${prefix}.text`}
      component={MarkdownTextAreaField}
      preview={PREVIEW_FIRST}
      previewPreprocessor={previewPreprocessor}
      disabled={!enabled}
      label={
        <>
          <FormattedMessage
            id="app.editAssignmentForm.localized.completeDescription"
            defaultMessage="Complete description:"
          />
          <Explanation id="exercise-text-explanation">
            <FormattedMessage
              id="app.editAssignmentForm.localized.completeDescriptionExplanation"
              defaultMessage="The text should contain everything the user needs to solve this exercise. You can use exercise file link keys in the text (%%link-key%%) which will be replaced with proper URLs for file downloads in after Markdown rendering. Double-click the text below to open the editor dialog."
            />
          </Explanation>
        </>
      }
    />

    <Field
      name={`${prefix}.link`}
      component={TextField}
      maxLength={1024}
      disabled={!enabled}
      label={
        <>
          <FormattedMessage
            id="app.editAssignmentForm.localized.link"
            defaultMessage="Link to an external complete description:"
          />
          <Explanation id="exercise-link-explanation">
            <FormattedMessage
              id="app.editAssignmentForm.localized.linkExplanation"
              defaultMessage="An URL pointing to an external Markdown document containing the complete exercise description. If the document is accessible in the cross-site mode, ReCodEx will use it to download and render the description seamlessly. If you wish to emphasize, this is a link and visualize it as such, consider using a Markdown link in the 'Complete description' field above."
            />
          </Explanation>
        </>
      }
      validate={isURL}
    />
  </>
);

SharedExerciseAssignmentLocalizedFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  previewPreprocessor: PropTypes.func,
};

export default SharedExerciseAssignmentLocalizedFields;
