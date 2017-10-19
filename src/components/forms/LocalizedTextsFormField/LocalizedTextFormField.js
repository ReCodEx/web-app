import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import {
  MarkdownTextAreaField,
  LanguageSelectField,
  TextField
} from '../Fields';

const LocalizedTextFormField = ({ prefix }) =>
  <div>
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
      name={`${prefix}.shortText`}
      component={TextField}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.title"
          defaultMessage="Localized title:"
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
  </div>;

LocalizedTextFormField.propTypes = {
  prefix: PropTypes.string.isRequired
};

export default LocalizedTextFormField;
