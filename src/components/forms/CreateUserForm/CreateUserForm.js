import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { reduxForm, Field, change } from 'redux-form';
import isEmail from 'validator/lib/isEmail.js';

import SubmitButton from '../SubmitButton';
import Callout from '../../widgets/Callout';
import Explanation from '../../widgets/Explanation';
import UsersName from '../../Users/UsersName';
import { SendIcon, WarningIcon } from '../../icons';
import { validateRegistrationData } from '../../../redux/modules/users.js';
import { TextField, PasswordField, PasswordStrength, CheckboxField } from '../Fields';

const CreateUserForm = ({
  matchingUsers,
  submitting,
  handleSubmit,
  onSubmit,
  dirty,
  submitFailed = false,
  submitSucceeded = false,
  asyncValidating,
  invalid,
  reset,
  change,
}) => (
  <div>
    <Field
      name="firstName"
      component={TextField}
      maxLength={100}
      required
      ignoreDirty
      label={<FormattedMessage id="app.editUserProfile.firstName" defaultMessage="Given Name:" />}
    />

    <Field
      name="lastName"
      component={TextField}
      maxLength={255}
      required
      ignoreDirty
      label={<FormattedMessage id="app.editUserProfile.lastName" defaultMessage="Surname:" />}
    />

    <Field
      name="email"
      component={TextField}
      autoComplete="off"
      maxLength={255}
      ignoreDirty
      label={<FormattedMessage id="app.changePasswordForm.email" defaultMessage="Email:" />}
    />

    <Field
      name="password"
      component={PasswordField}
      autoComplete="off"
      ignoreDirty
      label={<FormattedMessage id="app.changePasswordForm.password" defaultMessage="New Password:" />}
    />

    <Field
      name="passwordStrength"
      component={PasswordStrength}
      label={<FormattedMessage id="app.changePasswordForm.passwordStrength" defaultMessage="Password Strength:" />}
    />

    <Field
      name="passwordConfirm"
      component={PasswordField}
      ignoreDirty
      label={<FormattedMessage id="app.changePasswordForm.passwordCheck" defaultMessage="New Password (again):" />}
    />

    {matchingUsers && matchingUsers.length > 0 && (
      <>
        <hr />
        <h5>
          <WarningIcon className="text-warning" gapRight={2} />
          <FormattedMessage
            id="app.inviteUserForm.matchingUsers"
            defaultMessage="There are existing users of the same name"
          />
          :
        </h5>

        <Table bordered>
          <tbody>
            {matchingUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <UsersName {...user} showEmail="full" showExternalIdentifiers showRoleIcon />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Field
          name="ignoreNameCollision"
          component={CheckboxField}
          onOff
          label={
            <span>
              <FormattedMessage
                id="app.inviteUserForm.ignoreNameCollision"
                defaultMessage="The user I am inviting does not match any of the existing users"
              />
              <Explanation id="ignoreNameCollisionExplanation">
                <FormattedMessage
                  id="app.inviteUserForm.ignoreNameCollisionExplanation"
                  defaultMessage="Please, make sure the listed students are not the same person as the one you are inviting to prevent duplicate accounts in the system."
                />
              </Explanation>
            </span>
          }
        />
      </>
    )}

    <hr />

    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage id="generic.operationFailed" defaultMessage="Operation failed. Please try again later." />
      </Callout>
    )}

    <div className="text-center">
      <SubmitButton
        id="createUser"
        handleSubmit={handleSubmit(data =>
          onSubmit(data).then(success => {
            if (success) {
              reset();
            } else {
              // a hack so the change takes place after the whole submit process is completed
              window.setTimeout(() => change('ignoreNameCollision', false), 0);
            }
          })
        )}
        resetTimeout={0}
        submitting={submitting}
        dirty={dirty}
        invalid={invalid}
        hasSucceeded={submitSucceeded}
        hasFailed={submitFailed}
        asyncValidating={asyncValidating}
        defaultIcon={<SendIcon gapRight={2} />}
        messages={{
          submit: <FormattedMessage id="generic.create" defaultMessage="Create" />,
          submitting: <FormattedMessage id="generic.creating" defaultMessage="Creating..." />,
        }}
      />
    </div>
  </div>
);

CreateUserForm.propTypes = {
  matchingUsers: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  asyncValidate: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  reset: PropTypes.func,
  change: PropTypes.func,
};

const validate = (
  { firstName, lastName, email, password, passwordConfirm, ignoreNameCollision },
  { matchingUsers }
) => {
  const errors = {};

  if (!firstName) {
    errors.firstName = (
      <FormattedMessage
        id="app.editUserProfile.validation.emptyFirstName"
        defaultMessage="First name cannot be empty."
      />
    );
  }

  if (firstName && firstName.length < 2) {
    errors.firstName = (
      <FormattedMessage
        id="app.editUserProfile.validation.shortFirstName"
        defaultMessage="First name must contain at least 2 characters."
      />
    );
  }

  if (!lastName) {
    errors.lastName = (
      <FormattedMessage id="app.editUserProfile.validation.emptyLastName" defaultMessage="Last name cannot be empty." />
    );
  }

  if (lastName && lastName.length < 2) {
    errors.lastName = (
      <FormattedMessage
        id="app.editUserProfile.validation.shortLastName"
        defaultMessage="Last name must contain at least 2 characters."
      />
    );
  }

  if (email && isEmail(email) === false) {
    errors.email = (
      <FormattedMessage
        id="app.editUserProfile.validation.emailNotValid"
        defaultMessage="E-mail address is not valid."
      />
    );
  } else if (!email) {
    errors.email = (
      <FormattedMessage
        id="app.editUserProfile.validation.emptyEmail"
        defaultMessage="E-mail address cannot be empty."
      />
    );
  }

  if (!password) {
    errors.password = (
      <FormattedMessage
        id="app.createUserForm.validation.emptyPassword"
        defaultMessage="The password cannot be empty."
      />
    );
  }

  if (!passwordConfirm) {
    errors.passwordConfirm = (
      <FormattedMessage
        id="app.createUserForm.validation.emptyPassword"
        defaultMessage="The password cannot be empty."
      />
    );
  }

  if (password !== passwordConfirm) {
    errors.passwordConfirm = (
      <FormattedMessage
        id="app.editUserProfile.validation.passwordsNotMatch"
        defaultMessage="Passwords do not match."
      />
    );
  }

  if (matchingUsers && matchingUsers.length > 0 && !ignoreNameCollision) {
    errors.ignoreNameCollision = (
      <FormattedMessage
        id="app.inviteUserForm.validation.ignoreNameCollision"
        defaultMessage="Please check the list of existing users and confirm that the invited user is a new user."
      />
    );
  }
  return errors;
};

const asyncValidate = ({ email, password = '' }, dispatch) => {
  if (!password) {
    dispatch(change('create-user', 'passwordStrength', undefined));
  }

  return dispatch(validateRegistrationData(email, password))
    .then(res => res.value)
    .then(({ usernameIsFree, passwordScore }) => {
      dispatch(change('create-user', 'passwordStrength', passwordScore));

      if (!usernameIsFree) {
        const errors = {
          email: (
            <FormattedMessage
              id="app.createUserForm.validation.emailTaken"
              defaultMessage="This email address is already taken by someone else."
            />
          ),
        };
        throw errors;
      }
    });
};
export default reduxForm({
  form: 'create-user',
  validate,
  asyncValidate,
  asyncBlurFields: ['email', 'password', 'passwordConfirm'],
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(CreateUserForm);
