import React, { PropTypes } from 'react';
import { reduxForm, Field, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button, Alert, HelpBlock } from 'react-bootstrap';
import isNumeric from 'validator/lib/isNumeric';

import { LoadingIcon, SuccessIcon } from '../../Icons';
import FormBox from '../../AdminLTE/FormBox';
import { DatetimeField, TextField, TextAreaField, MarkdownTextAreaField, CheckboxField, SourceCodeField } from '../Fields';
import SubmitButton from '../SubmitButton';
import { validateRegistrationData } from '../../../redux/modules/users';
import { getJsData } from '../../../redux/helpers/resourceManager';

import 'codemirror/mode/yaml/yaml';

const EditAssignmentLimitsForm = ({
  assignment,
  initialValues: limits,
  submitting,
  handleSubmit,
  hasFailed = false,
  hasSucceeded = false,
  invalid,
  formValues: {
    firstDeadline,
    allowSecondDeadline
  } = {}
}) => (
  <FormBox
    title={<FormattedMessage id='app.editAssignmentLimitsForm.title' defaultMessage='Edit limits of {name}' values={{ name: assignment.name }} />}
    type={hasSucceeded ? 'success' : undefined}
    footer={
      <div className='text-center'>
        <SubmitButton
          invalid={invalid}
          submitting={submitting}
          hasSucceeded={hasSucceeded}
          hasFailed={hasFailed}
          handleSubmit={handleSubmit}
          messages={{
            submit: <FormattedMessage id='app.editAssignmentLimitsForm.submit' defaultMessage='Change limits' />,
            submitting: <FormattedMessage id='app.editAssignmentLimitsForm.submitting' defaultMessage='Saving limits ...' />,
            success: <FormattedMessage id='app.editAssignmentLimitsForm.success' defaultMessage='Limits were saved.' />
          }} />
      </div>
    }>
    {hasFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.editAssignmentLimitsForm.failed' defaultMessage='Saving failed. Please try again later.' />
      </Alert>)}

  </FormBox>
);

EditAssignmentLimitsForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired
};

const validate = ({
}) => {
  const errors = {};
  return errors;
};

export default reduxForm({
  form: 'editAssignmentLimits',
  validate
})(EditAssignmentLimitsForm);
