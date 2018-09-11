import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';

import { CheckboxField, LanguageSelectField } from '../Fields';

const EditUserSettingsForm = ({
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  anyTouched,
  invalid
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.editUserSettings.title"
        defaultMessage="Edit settings"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editUserSettings"
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          dirty={anyTouched}
          messages={{
            submit: (
              <FormattedMessage id="generic.save" defaultMessage="Save" />
            ),
            submitting: (
              <FormattedMessage
                id="generic.saving"
                defaultMessage="Saving ..."
              />
            ),
            success: (
              <FormattedMessage id="generic.saved" defaultMessage="Saved" />
            )
          }}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.editUserSettings.failed"
          defaultMessage="Cannot save profile settings."
        />
      </Alert>}

    <Field
      name="vimMode"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.vimMode"
          defaultMessage="Use Vim mode in source code editors."
        />
      }
    />

    <Field
      name="darkTheme"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.darkTheme"
          defaultMessage="Use a dark theme for the source code viewers and editors."
        />
      }
    />

    <Field
      name="openedSidebar"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.openedSidebar"
          defaultMessage="Sidebar is unfolded by default."
        />
      }
    />

    <Field
      name="useGravatar"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.useGravatar"
          defaultMessage="Use Gravatar service for fetching user avatars."
        />
      }
    />

    <Field
      name="defaultLanguage"
      tabIndex={1}
      component={LanguageSelectField}
      label={
        <FormattedMessage
          id="app.editUserSettings.defaultLanguage"
          defaultMessage="Default language:"
        />
      }
    />

    <h3>
      <FormattedMessage
        id="app.editUserSettings.emailsTitle"
        defaultMessage="Emails:"
      />
    </h3>

    <Field
      name="newAssignmentEmails"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.newAssignmentEmails"
          defaultMessage="Notify about new assignments"
        />
      }
    />

    <Field
      name="assignmentDeadlineEmails"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.assignmentDeadlineEmails"
          defaultMessage="Notify about near assignments deadline"
        />
      }
    />

    <Field
      name="submissionEvaluatedEmails"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.submissionEvaluatedEmails"
          defaultMessage="Notify about submission evaluation"
        />
      }
    />
  </FormBox>;

EditUserSettingsForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  anyTouched: PropTypes.bool,
  invalid: PropTypes.bool
};

export default reduxForm({
  form: 'edit-user-settings',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false
})(EditUserSettingsForm);
