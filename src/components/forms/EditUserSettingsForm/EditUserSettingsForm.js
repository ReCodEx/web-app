import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import { CheckboxField, LanguageSelectField, SelectField } from '../Fields';

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
      <Alert bsStyle="danger">
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

    <h3>
      <FormattedMessage id="app.editUserSettings.emailsTitle" defaultMessage="Emails:" />
    </h3>

    <Field
      name="newAssignmentEmails"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage id="app.editUserSettings.newAssignmentEmails" defaultMessage="Notify about new assignments" />
      }
    />

    <Field
      name="assignmentDeadlineEmails"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.assignmentDeadlineEmails"
          defaultMessage="Notify about approaching assignments deadline"
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

    <Field
      name="solutionCommentsEmails"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserSettings.solutionCommentsEmails"
          defaultMessage="Notify about new submission comments"
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
          defaultMessage="Notify about modifications of awarded points"
        />
      }
    />
  </FormBox>
);

EditUserSettingsForm.propTypes = {
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
