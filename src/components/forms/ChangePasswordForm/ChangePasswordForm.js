import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/TheButton';

import { SuccessIcon, LoadingIcon } from '../../icons';
import Callout from '../../widgets/Callout';
import FormBox from '../../widgets/FormBox';
import { PasswordField, PasswordStrength } from '../Fields';
import { validatePasswordStrength } from '../../../redux/modules/auth';

const ChangePasswordForm = ({
  submitting,
  handleSubmit,
  hasFailed = false,
  hasSucceeded = false,
  invalid,
  firstTime = false,
}) => (
  <FormBox
    title={
      firstTime ? (
        <FormattedMessage id="app.changePasswordForm.titleFirstTime" defaultMessage="Set your ReCodEx password" />
      ) : (
        <FormattedMessage id="app.changePasswordForm.title" defaultMessage="Change your ReCodEx password" />
      )
    }
    type={hasSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <Button type="submit" onClick={handleSubmit} variant="success" disabled={invalid || submitting || hasSucceeded}>
          {!submitting ? (
            hasSucceeded ? (
              <>
                <SuccessIcon gapRight />
                {firstTime ? (
                  <FormattedMessage
                    id="app.changePasswordForm.successFirstTime"
                    defaultMessage="Password has been set."
                  />
                ) : (
                  <FormattedMessage id="app.changePasswordForm.success" defaultMessage="Password has been changed." />
                )}
              </>
            ) : firstTime ? (
              <FormattedMessage id="app.changePasswordForm.createPassword" defaultMessage="Create Password" />
            ) : (
              <FormattedMessage id="app.changePasswordForm.changePassword" defaultMessage="Change Password" />
            )
          ) : (
            <>
              <LoadingIcon gapRight />
              {firstTime ? (
                <FormattedMessage id="app.changePasswordForm.setting" defaultMessage="Setting..." />
              ) : (
                <FormattedMessage id="app.changePasswordForm.changning" defaultMessage="Changing..." />
              )}
            </>
          )}
        </Button>
      </div>
    }>
    {hasSucceeded && (
      <Callout variant="success">
        <FormattedMessage
          id="app.changePasswordForm.succeeded"
          defaultMessage="You can now log in with your new password."
        />
      </Callout>
    )}

    {hasFailed && (
      <Callout variant="danger">
        <FormattedMessage id="app.changePasswordForm.failed" defaultMessage="Password update failed." />
      </Callout>
    )}

    <Field
      name="password"
      required
      component={PasswordField}
      label={<FormattedMessage id="app.changePasswordForm.password" defaultMessage="New Password:" />}
    />
    <Field
      name="passwordCheck"
      component={PasswordField}
      label={<FormattedMessage id="app.changePasswordForm.passwordCheck" defaultMessage="New Password (again):" />}
    />
    <Field
      name="passwordStrength"
      component={PasswordStrength}
      label={<FormattedMessage id="app.changePasswordForm.passwordStrength" defaultMessage="Password Strength:" />}
    />
  </FormBox>
);

ChangePasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  firstTime: PropTypes.bool,
};

const validate = ({ password, passwordCheck }) => {
  const errors = {};
  if (!password) {
    errors.password = (
      <FormattedMessage
        id="app.changePasswordForm.validation.emptyPassword"
        defaultMessage="Password cannot be empty."
      />
    );
  }

  if (!passwordCheck || passwordCheck !== password) {
    errors.passwordCheck = (
      <FormattedMessage
        id="app.changePasswordForm.validation.passwordsDontMatch"
        defaultMessage="Passwords do not match."
      />
    );
  }

  return errors;
};

const asyncValidate = ({ password = '' }, dispatch) =>
  new Promise((resolve, reject) =>
    dispatch(validatePasswordStrength(password))
      .then(res => res.value)
      .then(({ passwordScore }) => {
        const errors = {};
        if (passwordScore <= 0) {
          errors.password = (
            <FormattedMessage
              id="app.changePasswordForm.validation.passwordTooWeak"
              defaultMessage="The password you chose is too weak, please choose a different one."
            />
          );
        }
        dispatch(change('changePassword', 'passwordStrength', passwordScore));

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
      })
      .then(resolve())
      .catch(errors => reject(errors))
  );

export default reduxForm({
  form: 'changePassword',
  validate,
  asyncValidate,
  asyncBlurFields: ['password'],
})(ChangePasswordForm);
