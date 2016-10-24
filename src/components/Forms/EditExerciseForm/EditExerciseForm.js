import React, { PropTypes } from 'react';
import { canUseDOM } from 'exenv';
import { reduxForm, Field, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button, Alert, HelpBlock } from 'react-bootstrap';
import isNumeric from 'validator/lib/isNumeric';

import { LoadingIcon, SuccessIcon } from '../../Icons';
import FormBox from '../../AdminLTE/FormBox';
import {
  TextField,
  MarkdownTextAreaField,
  CheckboxField,
  SelectField,
  SourceCodeField,
  SingleUploadField
} from '../Fields';
import SubmitButton from '../SubmitButton';
import { validateRegistrationData } from '../../../redux/modules/users';
import { getJsData } from '../../../redux/helpers/resourceManager';

if (canUseDOM) {
  require('codemirror/mode/yaml/yaml');
}

const EditExerciseForm = ({
  initialValues: exercise,
  submitting,
  handleSubmit,
  hasFailed = false,
  hasSucceeded = false,
  invalid
}) => (
  <FormBox
    title={<FormattedMessage id='app.editExerciseForm.title' defaultMessage='Edit assignment {name}' values={{ name: exercise.name }} />}
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
            submit: <FormattedMessage id='app.editExerciseForm.submit' defaultMessage='Edit settings' />,
            submitting: <FormattedMessage id='app.editExerciseForm.submitting' defaultMessage='Saving changes ...' />,
            success: <FormattedMessage id='app.editExerciseForm.success' defaultMessage='Settings were saved.' />
          }} />
      </div>
    }>
    {hasFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.editExerciseForm.failed' defaultMessage='Saving failed. Please try again later.' />
      </Alert>)}

    <Field
      name='name'
      component={TextField}
      label={<FormattedMessage id='app.editExerciseForm.name' defaultMessage='Assignment name:' />} />

    <Field
      name='isPublic'
      component={CheckboxField}
      onOff
      colored
      label={<FormattedMessage id='app.editExerciseForm.isPublic' defaultMessage='Supervisors can assign this exercise to students' />} />

    <Field
      name='description'
      component={MarkdownTextAreaField}
      label={<FormattedMessage id='app.editExerciseForm.assignment' defaultMessage='Assignment and description for the students:' />} />

    <Field
      name='assignment'
      component={MarkdownTextAreaField}
      label={<FormattedMessage id='app.editExerciseForm.assignment' defaultMessage='Assignment and description for the students:' />} />

    <Field
      name='scoreConfig'
      component={SourceCodeField}
      mode='yaml'
      label={<FormattedMessage id='app.editExerciseForm.scoreConfig' defaultMessage='Score configuration:' />} />
    <HelpBlock>Read more about <a href='/@todo'>score configuration</a> syntax.</HelpBlock>

    {/* */}

    <Field
      name='jobConfig'
      component={SingleUploadField}
      label={<FormattedMessage id='app.editExerciseForm.jobConfigFile' defaultMessage='Job configuration file' />} />

    <Field
      name='difficulty'
      component={SelectField}
      label={<FormattedMessage id='app.editExerciseForm.jobConfigFile' defaultMessage='Job configuration file' />} />

  </FormBox>
);

EditExerciseForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired
};

const validate = ({
  name,
  description,
  assignment,
  jobConfig
}) => {
  const errors = {};

  if (!name) {
    errors['name'] = <FormattedMessage id='app.editExerciseForm.validation.emptyName' defaultMessage='Please fill the name of the assignment.' />;
  }

  if (!description) {
    errors['description'] = <FormattedMessage id='app.editExerciseForm.validation.description' defaultMessage='Please fill the description of the assignment.' />;
  }

  if (!assignment) {
    errors['assignment'] = <FormattedMessage id='app.editExerciseForm.validation.assignemt' defaultMessage='Please fill the assignment.' />;
  }

  if (!jobConfig) {
    errors['jobConfig'] = <FormattedMessage id='app.editExerciseForm.validation.jobConfig' defaultMessage='Please add a job config file.' />;
  }

  return errors;
};

export default reduxForm({
  form: 'editExercise',
  validate
})(EditExerciseForm);
