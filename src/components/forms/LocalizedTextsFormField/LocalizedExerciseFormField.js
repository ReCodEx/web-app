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

    <Field
      name={`${prefix}.description`}
      component={MarkdownTextAreaField}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.abstract"
          defaultMessage="Short description (abstract):"
        />
      }
    />
  </div>;

LocalizedExerciseFormField.propTypes = {
  prefix: PropTypes.string.isRequired
};

export default LocalizedExerciseFormField;
