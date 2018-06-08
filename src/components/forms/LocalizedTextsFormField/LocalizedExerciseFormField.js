import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import {
  MarkdownTextAreaField,
  LanguageSelectField,
  TextField
} from '../Fields';
import { WarningIcon } from '../../icons';

const isURL = url => {
  const pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return url !== '' && !pattern.test(url)
    ? <FormattedMessage
        id="app.editAssignmentForm.localized.urlValidation"
        defaultMessage="Given string is not a valid URL."
      />
    : null;
};

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

    {isAssignment &&
      <Alert bsStyle="info">
        <WarningIcon gapRight />
        <FormattedMessage
          id="app.editAssignmentForm.localized.assignmentSyncInfo"
          defaultMessage="Please note that the localized texts are overwritten by actual data from the exercise when exercise update is invoked."
        />
      </Alert>}

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
      name={`${prefix}.link`}
      component={TextField}
      label={
        <FormattedMessage
          id="app.editAssignmentForm.localized.link"
          defaultMessage="Link to an external complete description:"
        />
      }
      validate={isURL}
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
