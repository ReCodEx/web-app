import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert, Table } from 'react-bootstrap';
import classnames from 'classnames';

import {
  knownRoles,
  roleLabels,
  roleDescriptions,
  UserRoleIcon
} from '../../helpers/usersRoles';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import { EMPTY_OBJ } from '../../../helpers/common';

const EditUserRoleForm = ({
  currentRole = null,
  change,
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.editUserRoleForm.title"
        defaultMessage="Set User's Role"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    noPadding
    footer={
      <div className="text-center">
        <SubmitButton
          id="setRole"
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={EMPTY_OBJ}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="generic.savingFailed"
          defaultMessage="Saving failed. Please try again later."
        />
      </Alert>}

    <Table hover className="no-margin">
      <tbody>
        {knownRoles.map(role =>
          <tr
            key={role}
            className={classnames({
              'bg-info': role === currentRole
            })}
            onClick={() => change('role', role)}
          >
            <td className="shrink-col text-nowrap text-center">
              <Field name="role" component="input" type="radio" value={role} />
            </td>
            <td className="shrink-col text-nowrap text-center">
              <UserRoleIcon role={role} />
            </td>
            <td
              className={classnames({
                'text-bold': role === currentRole,
                'shrink-col': true,
                'text-nowrap': true
              })}
            >
              {roleLabels[role]}
            </td>
            <td className="small text-muted valign-middle">
              {roleDescriptions[role]}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </FormBox>;

EditUserRoleForm.propTypes = {
  currentRole: PropTypes.string,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool
};

export default reduxForm({
  form: 'user-role',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false
})(EditUserRoleForm);
