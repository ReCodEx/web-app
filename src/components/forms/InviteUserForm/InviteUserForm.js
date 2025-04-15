import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Table } from 'react-bootstrap';
import isEmail from 'validator/lib/isEmail.js';

import SubmitButton from '../SubmitButton';
import UsersName from '../../Users/UsersName';
import Callout from '../../widgets/Callout';
import Explanation from '../../widgets/Explanation';
import { validateRegistrationData } from '../../../redux/modules/users.js';
import { TextField, CheckboxField } from '../Fields';
import { WarningIcon } from '../../icons';

import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData.js';
import { EMPTY_ARRAY } from '../../../helpers/common.js';

const InviteUserForm = ({
  groups,
  groupsAccessor,
  matchingUsers = EMPTY_ARRAY,
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
  intl: { locale },
}) => (
  <div>
    <Field
      name="email"
      component={TextField}
      autoComplete="off"
      maxLength={255}
      ignoreDirty
      label={<FormattedMessage id="app.inviteUserForm.emailAndLogin" defaultMessage="Email (and login name):" />}
    />

    <hr />

    <Field
      name="titlesBeforeName"
      component={TextField}
      maxLength={42}
      required
      label={<FormattedMessage id="app.editUserProfile.titlesBeforeName" defaultMessage="Prefix Title:" />}
    />

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
      name="titlesAfterName"
      component={TextField}
      maxLength={42}
      required
      label={<FormattedMessage id="app.editUserProfile.titlesAfterName" defaultMessage="Suffix Title:" />}
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

    {groups.map(group => (
      <Field
        key={group.id}
        name={`groups.id${group.id}`}
        component={CheckboxField}
        label={getGroupCanonicalLocalizedName(group, groupsAccessor, locale)}
      />
    ))}

    <hr />

    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage id="generic.operationFailed" defaultMessage="Operation failed. Please try again later." />
      </Callout>
    )}

    <div className="text-center">
      <SubmitButton
        id="inviteUser"
        resetTimeout={0}
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
        submitting={submitting}
        dirty={dirty}
        invalid={invalid}
        hasSucceeded={submitSucceeded}
        hasFailed={submitFailed}
        asyncValidating={asyncValidating}
        messages={{
          submit: <FormattedMessage id="app.inviteUserForm.invite" defaultMessage="Invite" />,
          submitting: <FormattedMessage id="app.inviteUserForm.inviting" defaultMessage="Inviting..." />,
        }}
      />
    </div>
  </div>
);

InviteUserForm.propTypes = {
  groups: PropTypes.array.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
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
  reset: PropTypes.func,
  change: PropTypes.func,
  intl: PropTypes.object.isRequired,
};

const validate = ({ firstName, lastName, email, ignoreNameCollision }, { matchingUsers }) => {
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

const asyncValidate = ({ email }, dispatch) =>
  dispatch(validateRegistrationData(email))
    .then(res => res.value)
    .then(({ usernameIsFree }) => {
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

export default reduxForm({
  form: 'invite-user',
  validate,
  asyncValidate,
  asyncBlurFields: ['email'],
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(injectIntl(InviteUserForm));
