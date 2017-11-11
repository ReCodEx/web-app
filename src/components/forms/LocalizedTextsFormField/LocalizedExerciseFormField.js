import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import {
  MarkdownTextAreaField,
  LanguageSelectField,
  TextField
} from '../Fields';

const LocalizedExerciseFormField = ({ prefix }) =>
  <div>
    <Field
      name={`${prefix}.name`}
      component={TextField}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.name"
          defaultMessage="Name:"
        />
      }
    />

    <Field
      name={`${prefix}.locale`}
      component={LanguageSelectField}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.locale"
          defaultMessage="The language:"
        />
      }
    />

    <Field
      name={`${prefix}.text`}
      component={MarkdownTextAreaField}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.assignment"
          defaultMessage="Description for the students:"
        />
      }
    />

    <Field
      name={`${prefix}.description`}
      component={MarkdownTextAreaField}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.description"
          defaultMessage="Description for supervisors:"
        />
      }
    />
  </div>;

LocalizedExerciseFormField.propTypes = {
  prefix: PropTypes.string.isRequired
};

export default LocalizedExerciseFormField;
