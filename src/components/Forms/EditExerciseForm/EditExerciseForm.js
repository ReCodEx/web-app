import React, { PropTypes } from 'react';
import { canUseDOM } from 'exenv';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';
import { Alert } from 'react-bootstrap';

import FormBox from '../../AdminLTE/FormBox';
import {
  TextField,
  SelectField,
  CheckboxField,
  MarkdownTextAreaField
} from '../Fields';
import SubmitButton from '../SubmitButton';
import LocalizedAssignmentsFormField from '../LocalizedAssignmentsFormField';

if (canUseDOM) {
  require('codemirror/mode/yaml/yaml');
}

const messages = defineMessages({
  easy: {
    id: 'app.editExerciseForm.easy',
    defaultMessage: 'Easy'
  },
  medium: {
    id: 'app.editExerciseForm.medium',
    defaultMessage: 'Medium'
  },
  hard: {
    id: 'app.editExerciseForm.hard',
    defaultMessage: 'Hard'
  }
});

const EditExerciseForm = ({
  initialValues: exercise,
  submitting,
  handleSubmit,
  submitFailed: hasFailed,
  submitSucceeded: hasSucceeded,
  invalid,
  formValues: {
    localizedAssignments
  } = {},
  intl: { formatMessage }
}) => (
  <FormBox
    title={<FormattedMessage id='app.editExerciseForm.title' defaultMessage='Edit exercise {name}' values={{ name: exercise.name }} />}
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
            submit: <FormattedMessage id='app.editExerciseForm.submit' defaultMessage='Save changes' />,
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
      label={<FormattedMessage id='app.editExerciseForm.name' defaultMessage='Exercise name:' />} />

    <Field
      name='difficulty'
      component={SelectField}
      options={[
        { key: '', name: '...' },
        { key: 'easy', name: formatMessage(messages.easy) },
        { key: 'medium', name: formatMessage(messages.medium) },
        { key: 'hard', name: formatMessage(messages.hard) }
      ]}
      label={<FormattedMessage id='app.editExerciseForm.difficulty' defaultMessage='Difficulty' />} />

    <Field
      name='description'
      component={MarkdownTextAreaField}
      label={<FormattedMessage id='app.editExerciseForm.description' defaultMessage='Description for supervisors:' />} />

    <Field
      name='isPublic'
      component={CheckboxField}
      onOff
      label={<FormattedMessage id='app.editExerciseForm.isPublic' defaultMessage='Exercise is public and can be assigned to students by their supervisors.' />} />

    <FieldArray
      name='localizedAssignments'
      localizedAssignments={localizedAssignments}
      component={LocalizedAssignmentsFormField} />
  </FormBox>
);

EditExerciseForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  formValues: PropTypes.shape({
    localizedAssignments: PropTypes.array
  })
};

const validate = ({
  name,
  description,
  difficulty
}) => {
  const errors = {};

  if (!name) {
    errors['name'] = <FormattedMessage id='app.editExerciseForm.validation.emptyName' defaultMessage='Please fill the name of the exercise.' />;
  }

  if (!difficulty) {
    errors['difficulty'] = <FormattedMessage id='app.editExerciseForm.validation.difficulty' defaultMessage='Please select the difficulty of the exercise.' />;
  }

  if (!description) {
    errors['description'] = <FormattedMessage id='app.editExerciseForm.validation.description' defaultMessage='Please fill the description of the exercise.' />;
  }

  return errors;
};

export default injectIntl(reduxForm({
  form: 'editExercise',
  validate
})(EditExerciseForm));
