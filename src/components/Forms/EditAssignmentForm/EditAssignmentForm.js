import React, { PropTypes } from 'react';
import { reduxForm, Field, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button, Alert } from 'react-bootstrap';
import isEmail from 'validator/lib/isEmail';

import { LoadingIcon, SuccessIcon } from '../../Icons';
import FormBox from '../../AdminLTE/FormBox';
import { DatetimeField, TextField, TextAreaField, MarkdownTextAreaField, CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';
import { validateRegistrationData } from '../../../redux/modules/users';
import { getJsData } from '../../../redux/helpers/resourceManager';

const EditAssignmentForm = ({
  initialValues: assignment,
  submitting,
  handleSubmit,
  hasFailed = false,
  hasSucceeded = false,
  invalid
}) => (
  <FormBox
    title={<FormattedMessage id='app.editAssignmentForm.title' defaultMessage='Edit assignment {name}' values={{ name: assignment.name }} />}
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
            submit: <FormattedMessage id='app.editAssignmentForm.submit' defaultMessage='Edit settings' />,
            submitting: <FormattedMessage id='app.editAssignmentForm.submitting' defaultMessage='Saving changes ...' />,
            success: <FormattedMessage id='app.editAssignmentForm.success' defaultMessage='Settings were saved.' />
          }} />
      </div>
    }>
    {hasFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.editAssignmentForm.failed' defaultMessage='Saving failed. Please try again later.' />
      </Alert>)}

    <Field
      name='name'
      component={TextField}
      label={<FormattedMessage id='app.editAssignmentForm.name' defaultMessage='Assignment name:' />} />

    <Field
      name='isPublic'
      component={CheckboxField}
      label={<FormattedMessage id='app.editAssignmentForm.isPublic' defaultMessage='Is public' />} />

    <Field
      name='description'
      component={MarkdownTextAreaField}
      label={<FormattedMessage id='app.editAssignmentForm.assignment' defaultMessage='Assignment and description for the students:' />} />

    <Field
      name='scoreConfig'
      component={TextAreaField}
      label={<FormattedMessage id='app.editAssignmentForm.name' defaultMessage='Assignment name:' />} />

    <Field
      name='firstDeadline'
      component={DatetimeField}
      label={<FormattedMessage id='app.editAssignmentForm.firstDeadline' defaultMessage='First deadline:' />} />

    <Field
      name='secondDeadline'
      component={DatetimeField}
      label={<FormattedMessage id='app.editAssignmentForm.secondDeadline' defaultMessage='Second deadline:' />} />
  </FormBox>
);

EditAssignmentForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

const validate = ({ name }) => {
  const errors = {};

  if (!name) {
    errors['name'] = <FormattedMessage id='app.editAssignmentForm.validation.emptyName' defaultMessage='Please fill the name of the assignment.' />;
  }

  return errors;
};

export default reduxForm({
  form: 'editAssignment',
  validate
})(EditAssignmentForm);
