import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';

import Callout from '../../widgets/Callout';
import FormBox from '../../widgets/FormBox';
import { SaveIcon } from '../../icons';
import SubmitButton from '../SubmitButton';
import { CheckboxField, LanguageSelectField } from '../Fields';
import { isStudentRole, isSupervisorRole } from '../../helpers/usersRoles.js';

const EditUserSettingsForm = ({
  user,
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  dirty,
  invalid,
}) => (
  <FormBox
    title={<FormattedMessage id="app.editUserSettings.title" defaultMessage="User Settings" />}
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
          dirty={dirty}
          defaultIcon={<SaveIcon gapRight={2} />}
          messages={{
            submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
            submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
            success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
          }}
        />
      </div>
    }>
    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage id="app.editUserSettings.failed" defaultMessage="Cannot save profile settings." />
      </Callout>
    )}

    <Field
      name="defaultLanguage"
      component={LanguageSelectField}
      label={<FormattedMessage id="app.editUserSettings.defaultLanguage" defaultMessage="Default language:" />}
    />

    <hr />

    <h5 className="mb-3">
      <FormattedMessage id="app.editUserSettings.emailsTitle" defaultMessage="Send E-mail Notifications" />:
    </h5>

    {!user.isVerified && (
      <Callout variant="warning">
        <FormattedMessage
          id="app.editUserSettings.emailStillNotVerifiedTitle"
          defaultMessage="Your email address is not verified, so no notifications will be sent regardless your personal settings."
        />
      </Callout>
    )}

    {isStudentRole(user.privateData.role) && (
      <>
        <Field
          name="newAssignmentEmails"
          component={CheckboxField}
          onOff
          label={
            <FormattedMessage id="app.editUserSettings.newAssignmentEmails" defaultMessage="New exercise assigned" />
          }
        />

        <Field
          name="assignmentDeadlineEmails"
          component={CheckboxField}
          onOff
          label={
            <FormattedMessage
              id="app.editUserSettings.assignmentDeadlineEmails"
              defaultMessage="Assignment deadline is approaching"
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
              defaultMessage="Submission evaluation (when taking a long time)"
            />
          }
        />

        <Field
          name="solutionAcceptedEmails"
          component={CheckboxField}
          onOff
          label={
            <FormattedMessage
              id="app.editUserSettings.solutionAcceptedEmails"
              defaultMessage="Solution accepted status changed"
            />
          }
        />

        <Field
          name="pointsChangedEmails"
          component={CheckboxField}
          onOff
          label={
            <FormattedMessage
              id="app.editUserSettings.pointsChangedEmails"
              defaultMessage="Awarded points modified by teacher"
            />
          }
        />
      </>
    )}

    <Field
      name="solutionCommentsEmails"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage id="app.editUserSettings.solutionCommentsEmails" defaultMessage="New solution comment" />
      }
    />

    <Field
      name="assignmentCommentsEmails"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.assignmentCommentsEmails"
          defaultMessage="New comment in public discussion of an assignment"
        />
      }
    />

    {isSupervisorRole(user.privateData.role) && (
      <>
        <Field
          name="assignmentSubmitAfterAcceptedEmails"
          component={CheckboxField}
          onOff
          label={
            <FormattedMessage
              id="app.editUserSettings.assignmentSubmitAfterAcceptedEmails"
              defaultMessage="New solution evaluated for an assignment where another solution has already been accepted"
            />
          }
        />

        <Field
          name="assignmentSubmitAfterReviewedEmails"
          component={CheckboxField}
          onOff
          label={
            <FormattedMessage
              id="app.editUserSettings.assignmentSubmitAfterReviewedEmails"
              defaultMessage="New solution evaluated for an assignment where another solution has already been reviewed"
            />
          }
        />

        <Field
          name="solutionReviewRequestedEmails"
          component={CheckboxField}
          onOff
          label={
            <FormattedMessage
              id="app.editUserSettings.solutionReviewRequestedEmails"
              defaultMessage="Student requested code review for a solution"
            />
          }
        />
      </>
    )}
  </FormBox>
);

EditUserSettingsForm.propTypes = {
  user: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  dirty: PropTypes.bool,
  invalid: PropTypes.bool,
};

export default reduxForm({
  form: 'edit-user-settings',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(EditUserSettingsForm);
