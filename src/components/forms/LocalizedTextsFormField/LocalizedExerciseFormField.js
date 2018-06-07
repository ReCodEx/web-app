import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import {
  MarkdownTextAreaField,
  LanguageSelectField,
  TextField
} from '../Fields';

const LocalizedExerciseFormField = ({ isAssignment = false, prefix }) =>
  <div>
    <Field
      name={`${prefix}.name`}
      component={TextField}
      label={
        <span>
          <FormattedMessage id="generic.name" defaultMessage="Name" />:
        </span>
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
          id="app.editAssignmentForm.localized.completeDescription"
          defaultMessage="Complete description (everything the user needs to solve this exercise):"
        />
      }
    />

    {!isAssignment && // it is an exercise
      <Field
        name={`${prefix}.description`}
        component={MarkdownTextAreaField}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.localized.description"
            defaultMessage="Short description (visible only to supervisors):"
          />
        }
      />}

    {isAssignment &&
      <Field
        name={`${prefix}.studentHint`}
        component={MarkdownTextAreaField}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.localized.studentHint"
            defaultMessage="A hint for students (not synchronized with exercise):"
          />
        }
      />}
  </div>;

LocalizedExerciseFormField.propTypes = {
  isAssignment: PropTypes.bool,
  prefix: PropTypes.string.isRequired
};

export default LocalizedExerciseFormField;
