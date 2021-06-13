import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import { CheckboxField, LanguageSelectField, SelectField } from '../Fields';
import { isStudentRole, isSupervisorRole } from '../../helpers/usersRoles';

const defaultPagesCaptions = defineMessages({
  dashboard: {
    id: 'app.editUserSettings.defaultPage.dashboard',
    defaultMessage: 'Dashboard',
  },
  home: {
    id: 'app.editUserSettings.defaultPage.home',
    defaultMessage: 'Home page (about)',
  },
  instance: {
    id: 'app.editUserSettings.defaultPage.instance',
    defaultMessage: 'Instance overview',
  },
});

const getDefaultPages = defaultMemoize(formatMessage =>
  Object.keys(defaultPagesCaptions).map(key => ({
    key,
    name: formatMessage(defaultPagesCaptions[key]),
  }))
);

const EditUserSettingsForm = ({
  user,
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  anyTouched,
  invalid,
  intl: { formatMessage },
}) => (
  <FormBox
    title={<FormattedMessage id="app.editUserSettings.title" defaultMessage="Edit settings" />}
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
            submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
            submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
            success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
          }}
        />
      </div>
    }>
    {submitFailed && (
      <Alert variant="danger">
        <FormattedMessage id="app.editUserSettings.failed" defaultMessage="Cannot save profile settings." />
      </Alert>
    )}

    <Field
      name="vimMode"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage id="app.editUserSettings.vimMode" defaultMessage="Use Vim mode in source code editors." />
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
        <FormattedMessage id="app.editUserSettings.openedSidebar" defaultMessage="Sidebar is unfolded by default." />
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
      component={LanguageSelectField}
      label={<FormattedMessage id="app.editUserSettings.defaultLanguage" defaultMessage="Default language:" />}
    />

    <Field
      name="defaultPage"
      component={SelectField}
      options={getDefaultPages(formatMessage)}
      addEmptyOption={true}
      label={<FormattedMessage id="app.editUserSettings.defaultPage" defaultMessage="Default page (after login):" />}
    />

    <hr />

    <h4>
      <FormattedMessage id="app.editUserSettings.emailsTitle" defaultMessage="Email Notifications" />:
    </h4>

    {isStudentRole(user.privateData.role) && (
      <React.Fragment>
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
      </React.Fragment>
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
    )}

    {isSupervisorRole(user.privateData.role) && (
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
  anyTouched: PropTypes.bool,
  invalid: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(
  reduxForm({
    form: 'edit-user-settings',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(EditUserSettingsForm)
);
