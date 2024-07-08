import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { Table } from 'react-bootstrap';
import classnames from 'classnames';

import { knownRoles, roleLabels, roleDescriptions, UserRoleIcon } from '../../helpers/usersRoles.js';
import Callout from '../../widgets/Callout';
import FormBox from '../../widgets/FormBox';
import { SaveIcon } from '../../icons';
import SubmitButton from '../SubmitButton';
import StandaloneRadioField from '../Fields/StandaloneRadioField.js';

const EditUserRoleForm = ({
  currentRole = null,
  change,
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
}) => (
  <FormBox
    title={<FormattedMessage id="app.editUserRoleForm.title" defaultMessage="Set User's Role" />}
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
          defaultIcon={<SaveIcon gapRight />}
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
        <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
      </Callout>
    )}

    <Table hover className="no-margin">
      <tbody>
        {knownRoles.map(role => (
          <tr
            key={role}
            className={classnames({
              'bg-info': role === currentRole,
            })}
            onClick={() => change('role', role)}>
            <td className="shrink-col text-nowrap text-center">
              <StandaloneRadioField name="role" value={role} />
            </td>
            <td className="shrink-col text-nowrap text-center">
              <UserRoleIcon role={role} />
            </td>
            <td
              className={classnames({
                'text-bold': role === currentRole,
                'shrink-col': true,
                'text-nowrap': true,
              })}>
              {roleLabels[role]}
            </td>
            <td className="small text-muted valign-middle">{roleDescriptions[role]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </FormBox>
);

EditUserRoleForm.propTypes = {
  currentRole: PropTypes.string,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
};

export default injectIntl(
  reduxForm({
    form: 'user-role',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(EditUserRoleForm)
);
