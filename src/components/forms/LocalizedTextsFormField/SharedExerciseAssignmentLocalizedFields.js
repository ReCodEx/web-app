import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { TextField, MarkdownTextAreaField } from '../Fields';

const isURL = url => {
  const pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return url && url.trim() !== '' && !pattern.test(url.trim()) ? (
    <FormattedMessage
      id="app.editAssignmentForm.localized.urlValidation"
      defaultMessage="Given string is not a valid URL."
    />
  ) : null;
};

const SharedExerciseAssignmentLocalizedFields = ({ prefix, enabled }) => (
  <>
    <Field
      name={`${prefix}.text`}
      component={MarkdownTextAreaField}
      disabled={!enabled}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.completeDescription"
          defaultMessage="Complete description (everything the user needs to solve this exercise):"
        />
      }
    />

    <Field
      name={`${prefix}.link`}
      component={TextField}
      maxLength={1024}
      disabled={!enabled}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.link"
          defaultMessage="Link to an external complete description:"
        />
      }
      validate={isURL}
    />
  </>
);

SharedExerciseAssignmentLocalizedFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default SharedExerciseAssignmentLocalizedFields;
