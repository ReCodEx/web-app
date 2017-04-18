import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { TextField, SelectField } from '../../Forms/Fields';
import SubmitButton from '../../Forms/SubmitButton';
import { HelpBlock } from 'react-bootstrap';
import { DeleteIcon } from '../../Icons';
import Button from '../../AdminLTE/FlatButton';
import UploadContainer from '../../../containers/UploadContainer';

const CreateReferenceSolution = (
  {
    exercise,
    canSubmit,
    reset,
    isSending,
    hasFailed,
    createReferenceSolution,
    submitting,
    submitFailed = false,
    submitSucceeded = false,
    anyTouched,
    invalid,
    ...props
  }
) => (
  <div>
    <UploadContainer id={exercise.id} />

    <Field
      name="note"
      component={TextField}
      required
      label={
        <FormattedMessage
          id="app.exercise.uploadReferenceSolution.noteLabel"
          defaultMessage="Description of the provided exercise solution"
        />
      }
    />

    <Field
      name="runtimeId"
      required
      component={SelectField}
      label={
        <FormattedMessage
          id="app.exercise.uploadReferenceSolution.runtimeConfigs"
          defaultMessage="Runtime Configuration:"
        />
      }
      options={[
        { key: '', name: '...' },
        ...exercise.runtimeConfigs.map(({ id: key, name }) => ({ key, name }))
      ]}
    />

    {hasFailed &&
      <p className="text-left callout callout-danger">
        <FormattedMessage
          id="app.exercise.uploadReferenceSolution.creationFailed"
          defaultMessage="Solution was rejected by the server."
        />
      </p>}

    <SubmitButton
      id="createReferenceSolution"
      handleSubmit={createReferenceSolution}
      submitting={submitting}
      hasSucceeded={submitSucceeded}
      hasFailed={submitFailed}
      dirty={anyTouched}
      invalid={invalid || exercise.runtimeConfigs.size === 0}
      messages={{
        submit: (
          <FormattedMessage
            id="app.exercise.uploadReferenceSolution.createButton"
            defaultMessage="Create account"
          />
        ),
        submitting: (
          <FormattedMessage
            id="app.exercise.uploadReferenceSolution.creatingButtonText"
            defaultMessage="Creating solution ..."
          />
        ),
        success: (
          <FormattedMessage
            id="app.exercise.uploadReferenceSolution.createSuccessful"
            defaultMessage="Solution created successfully."
          />
        )
      }}
    />

    <Button bsStyle="default" className="btn-flat" onClick={reset}>
      <DeleteIcon />
      {' '}
      <FormattedMessage
        id="app.exercise.uploadReferenceSolution.resetFormButton"
        defaultMessage="Reset form"
      />
    </Button>

    {!canSubmit &&
      <HelpBlock>
        <FormattedMessage
          id="app.exercise.uploadReferenceSolution.instructions"
          defaultMessage="You must attach at least one file with source code and wait, until all your files are uploaded to the server. If there is a problem uploading any of the files, please try uploading it again or remove the file. This form cannot be submitted until there are any files which have not been successfully uploaded or which could not have been uploaded to the server."
        />
      </HelpBlock>}
  </div>
);

CreateReferenceSolution.propTypes = {
  exercise: PropTypes.object.isRequired,
  reset: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool.isRequired,
  createReferenceSolution: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool,
  isSending: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  anyTouched: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ note, runtimeId }) => {
  const errors = {};

  if (!note) {
    errors['note'] = (
      <FormattedMessage
        id="app.exercise.uploadReferenceSolution.validation.emptyNote"
        defaultMessage="Description of the solution cannot be empty."
      />
    );
  }

  if (!runtimeId) {
    errors['runtimeId'] = (
      <FormattedMessage
        id="app.exercise.uploadReferenceSolution.validation.runtimeId"
        defaultMessage="Please select one of the runtime configurations."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'createReferenceSolution',
  validate
})(CreateReferenceSolution);
