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
              <FormattedMessage
                id="app.editUserSettings.set"
                defaultMessage="Save changes"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.editUserSettings.processing"
                defaultMessage="Saving ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.editUserSettings.success"
                defaultMessage="Account settings has been saved."
              />
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
      tabIndex={1}
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
      tabIndex={1}
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
      tabIndex={1}
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

export default reduxForm({ form: 'edit-user-settings' })(EditUserSettingsForm);
