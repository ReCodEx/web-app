import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';

import { TextField } from '../Fields';
import SubmitButton from '../SubmitButton';
import { AddIcon, LoadingIcon } from '../../../components/icons';

const AddExerciseTagForm = ({
  submitting,
  handleSubmit,
  onSubmit,
  reset,
  submitFailed,
  submitSucceeded,
  invalid,
  tags,
  updatePending = false,
}) => (
  <Form>
    <datalist id="knownExerciseTags">
      {tags.map(tag => (
        <option key={tag}>{tag}</option>
      ))}
    </datalist>

    <Field
      name="tag"
      component={TextField}
      ignoreDirty
      groupClassName="full-width"
      list="knownExerciseTags"
      maxLength={16}
      append={
        <SubmitButton
          id="addExerciseTag"
          disabled={invalid || updatePending}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          handleSubmit={handleSubmit(data => onSubmit(data).then(reset))}
          defaultIcon={updatePending ? <LoadingIcon gapRight /> : <AddIcon gapRight />}
          noShadow
          messages={{
            submit: <FormattedMessage id="app.addExerciseTagForm.submit" defaultMessage="Add Tag" />,
            submitting: <FormattedMessage id="app.addExerciseTagForm.submitting" defaultMessage="Adding..." />,
            success: <FormattedMessage id="app.addExerciseTagForm.success" defaultMessage="Tag Added" />,
          }}
        />
      }
    />
  </Form>
);

AddExerciseTagForm.propTypes = {
  exercise: PropTypes.object.isRequired,
  tags: PropTypes.array,
  updatePending: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func,
};

const validate = ({ tag }, { exercise }) => {
  const errors = {};
  if (!tag) {
    errors._error = true;
    return errors;
  }

  if (tag.length < 2) {
    errors.tag = (
      <FormattedMessage id="app.addExerciseTagForm.validation.tooShort" defaultMessage="The tag name is too short." />
    );
    return errors;
  }

  if (tag.length > 16) {
    errors.tag = (
      <FormattedMessage id="app.addExerciseTagForm.validation.tooLong" defaultMessage="The tag name is too long." />
    );
    return errors;
  }

  if (!tag.match(/^[-a-zA-Z0-9_]+$/)) {
    errors.tag = (
      <FormattedMessage
        id="app.addExerciseTagForm.validation.invalidCharacters"
        defaultMessage="The tag name contains invalid characters. Only alphanumeric letters, dash and underscore are allowed."
      />
    );
    return errors;
  }

  if (exercise && exercise.tags && exercise.tags.includes(tag)) {
    errors.tag = (
      <FormattedMessage
        id="app.addExerciseTagForm.validation.alreadyAssigned"
        defaultMessage="Given tag is already assigned to the exercise."
      />
    );
    return errors;
  }

  return errors;
};

const warn = ({ tag }, { tags }) => {
  const warnings = {};
  if (!tag) {
    return warnings;
  }

  if (tag.length < 3) {
    warnings.tag = (
      <FormattedMessage id="app.addExerciseTagForm.warnings.tooShort" defaultMessage="The tag name is rather short." />
    );
    return warnings;
  }

  if (tag.length > 12) {
    warnings.tag = (
      <FormattedMessage id="app.addExerciseTagForm.warnings.tooLong" defaultMessage="The tag name is rather long." />
    );
    return warnings;
  }

  if (tags && tags.length > 0) {
    if (!tags.includes(tag)) {
      warnings.tag = (
        <FormattedMessage
          id="app.addExerciseTagForm.warnings.newTag"
          defaultMessage="You have specified a new tag, which has not been used in any exercise yet. Make sure that there is not a typo in your tag and there is no other tag with the same meaning but different key word."
        />
      );
    }
    return warnings;
  }

  return warnings;
};

export default reduxForm({
  form: 'addExerciseTag',
  validate,
  warn,
})(AddExerciseTagForm);
