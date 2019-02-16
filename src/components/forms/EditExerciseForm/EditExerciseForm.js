import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray, touch } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';
import { Alert } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import { SelectField, CheckboxField } from '../Fields';

import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import { validateExercise } from '../../../redux/modules/exercises';
import { validateLocalizedTextsFormData } from '../../../helpers/localizedData';
import withLinks from '../../../helpers/withLinks';

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
  },
});

const difficultyOptions = defaultMemoize(formatMessage => [
  { key: 'easy', name: formatMessage(messages.easy) },
  { key: 'medium', name: formatMessage(messages.medium) },
  { key: 'hard', name: formatMessage(messages.hard) },
]);

const EditExerciseForm = ({
  initialValues: exercise,
  error,
  dirty,
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
  invalid,
  asyncValidating,
  intl: { formatMessage },
}) => (
  <FormBox
    title={
      <FormattedMessage
        id="app.editExerciseForm.title"
        defaultMessage="Edit exercise {name}"
        values={{ name: <LocalizedExerciseName entity={exercise} /> }}
      />
    }
    succeeded={submitSucceeded}
    dirty={dirty}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editExercise"
          invalid={invalid}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          handleSubmit={handleSubmit}
          asyncValidating={asyncValidating}
          messages={{
            submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
            submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
            success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
            validating: <FormattedMessage id="generic.validating" defaultMessage="Validating..." />,
          }}
        />
      </div>
    }>
    {submitFailed && (
      <Alert bsStyle="danger">
        <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
      </Alert>
    )}

    <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="exercise" />

    <Field
      name="difficulty"
      component={SelectField}
      options={difficultyOptions(formatMessage)}
      addEmptyOption={true}
      label={<FormattedMessage id="app.editExerciseForm.difficulty" defaultMessage="Difficulty" />}
    />

    <Field
      name="isPublic"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editExerciseForm.isPublic"
          defaultMessage="Exercise is public and can be assigned to students by their supervisors."
        />
      }
    />

    <Field
      name="isLocked"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editExerciseForm.isLocked"
          defaultMessage="Exercise is locked (visible, but cannot be assigned to any group)."
        />
      }
    />

    {error && dirty && <Alert bsStyle="danger">{error}</Alert>}
  </FormBox>
);

EditExerciseForm.propTypes = {
  error: PropTypes.any,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  links: PropTypes.object,
};

const validate = ({ difficulty, localizedTexts }) => {
  const errors = {};
  validateLocalizedTextsFormData(errors, localizedTexts, ({ name, text, link }) => {
    const textErrors = {};
    if (!name.trim()) {
      textErrors.name = (
        <FormattedMessage
          id="app.editExerciseForm.validation.emptyName"
          defaultMessage="Please fill the name of the exercise."
        />
      );
    }

    if (!text.trim() && !link.trim()) {
      textErrors.text = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.localizedText.text"
          defaultMessage="Please fill the description or provide an external link below."
        />
      );
    }

    return textErrors;
  });

  if (!difficulty) {
    errors.difficulty = (
      <FormattedMessage
        id="app.editExerciseForm.validation.difficulty"
        defaultMessage="Please select the difficulty of the exercise."
      />
    );
  }

  return errors;
};

const asyncValidate = (values, dispatch, { initialValues: { id, version } }) =>
  new Promise((resolve, reject) =>
    dispatch(validateExercise(id, version))
      .then(res => res.value)
      .then(({ versionIsUpToDate }) => {
        var errors = {};
        if (versionIsUpToDate === false) {
          errors['name'] = (
            <FormattedMessage
              id="app.editExerciseForm.validation.versionDiffers"
              defaultMessage="Somebody has changed the exercise while you have been editing it. Please reload the page and apply your changes once more."
            />
          );
          dispatch(touch('editExercise', 'name'));
        }

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
      })
      .then(resolve())
      .catch(errors => reject(errors))
  );

// Actually, this is reimplementation of default behavior from documentation.
// For some reason, the asyncValidation is by default called also for every change event (which is not documented).
const shouldAsyncValidate = ({ syncValidationPasses, trigger, pristine, initialized }) => {
  if (!syncValidationPasses) {
    return false;
  }
  switch (trigger) {
    case 'blur':
      return true;
    case 'submit':
      return !pristine || !initialized;
    default:
      return false;
  }
};

export default withLinks(
  reduxForm({
    form: 'editExercise',
    validate,
    asyncValidate,
    shouldAsyncValidate,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(injectIntl(EditExerciseForm))
);
