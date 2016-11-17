import React, { PropTypes } from 'react';
import { canUseDOM } from 'exenv';
import { reduxForm, Field, FieldArray, change } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';
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
import LocalizedAssignmentsFormField from '../LocalizedAssignmentsFormField';

if (canUseDOM) {
  require('codemirror/mode/yaml/yaml');
}

const messages = defineMessages({
    easy: {
        id: 'app.editExerciseForm.easy',
        defaultMessage: 'Easy',
    },
    medium: {
        id: 'app.editExerciseForm.medium',
        defaultMessage: 'Medium',
    },
    hard: {
        id: 'app.editExerciseForm.hard',
        defaultMessage: 'Hard',
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
  <div>
    <FieldArray
      name='localizedAssignments'
      localizedAssignments={localizedAssignments}
      component={LocalizedAssignmentsFormField} />

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
        name='difficulty'
        component={SelectField}
        options={[
          { key: "easy", name: formatMessage(messages.easy)},
          { key: "medium", name: formatMessage(messages.medium)},
          { key: "hard", name: formatMessage(messages.hard)}
          ]}
        label={<FormattedMessage id='app.editExerciseForm.difficulty' defaultMessage='Difficulty' />} />

    </FormBox>
  </div>
);

EditExerciseForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

const validate = ({
  name
}) => {
  const errors = {};

  if (!name) {
    errors['name'] = <FormattedMessage id='app.editExerciseForm.validation.emptyName' defaultMessage='Please fill the name of the assignment.' />;
  }

  return errors;
};

export default injectIntl(reduxForm({
  form: 'editExercise',
  validate
})(EditExerciseForm));
