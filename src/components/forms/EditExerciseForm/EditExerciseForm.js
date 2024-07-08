import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray, touch } from 'redux-form';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import { lruMemoize } from 'reselect';

import { SelectField, CheckboxField, NumericTextField } from '../Fields';

import Callout from '../../widgets/Callout';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import { validateExercise } from '../../../redux/modules/exercises.js';
import { validateLocalizedTextsFormData } from '../../../helpers/localizedData.js';
import Explanation from '../../widgets/Explanation';
import { SaveIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks.js';

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

const difficultyOptions = lruMemoize(formatMessage => [
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
    id="texts-form"
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
          defaultIcon={<SaveIcon gapRight />}
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
      <Callout variant="danger">
        <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
      </Callout>
    )}

    <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="exercise" />

    <Field
      name="difficulty"
      component={SelectField}
      options={difficultyOptions(formatMessage)}
      addEmptyOption={true}
      label={<FormattedMessage id="app.editExerciseForm.difficulty" defaultMessage="Difficulty" />}
    />

    <NumericTextField
      name="solutionFilesLimit"
      validateMin={1}
      validateMax={100}
      maxLength={3}
      nullable
      label={
        <span>
          <FormattedMessage id="app.editExerciseForm.solutionFilesLimit" defaultMessage="Solution files limit:" />
          <Explanation id="solutionFilesLimitExplanation">
            <FormattedMessage
              id="app.exercise.solutionFilesLimitExplanation"
              defaultMessage="Maximal number of files submitted in a solution. The users are not allowed to submit solutions that exceed this limit. If empty, no limit is applied."
            />
            <hr />
            <strong>
              <FormattedMessage
                id="app.exercise.defaultValueForAssignment"
                defaultMessage="This is a default (recommended) value for assignments, but each assignment of this exercise may set it individually. Modifications of this value are not synchronized with already created assignments."
              />
            </strong>
          </Explanation>
        </span>
      }
    />

    <NumericTextField
      name="solutionSizeLimit"
      validateMin={1}
      validateMax={128 * 1024}
      maxLength={6}
      nullable
      label={
        <span>
          <FormattedMessage
            id="app.editExerciseForm.solutionSizeLimit"
            defaultMessage="Solution total size [KiB] limit:"
          />
          <Explanation id="solutionSizeLimitExplanation">
            <FormattedMessage
              id="app.exercise.solutionSizeLimitExplanation"
              defaultMessage="Maximal total size of all files submitted in a solution. The users are not allowed to submit solutions that exceed this limit. If empty, no limit is applied."
            />
            <hr />
            <strong>
              <FormattedMessage
                id="app.exercise.defaultValueForAssignment"
                defaultMessage="This is a default (recommended) value for assignments, but each assignment of this exercise may set it individually. Modifications of this value are not synchronized with already created assignments."
              />
            </strong>
          </Explanation>
        </span>
      }
    />

    <Field
      name="mergeJudgeLogs"
      component={CheckboxField}
      onOff
      label={
        <span>
          <FormattedMessage id="app.editExerciseForm.mergeJudgeLogs" defaultMessage="Merge judge logs in one" />
          <Explanation id="mergeJudgeLogsExplanation">
            <FormattedMessage
              id="app.exercise.mergeJudgeLogsExplanation"
              defaultMessage="The merge flag indicates whether primary (stdout) and secondary (stderr) judge logs are are concatenated in one log (which should be default for built-in judges). If the logs are separated, the visibility of each part may be controlled idividually in assignments. That might be helpful if you need to pass two separate logs from a custom judge (e.g., one is for students and one is for supervisors)."
            />
          </Explanation>
        </span>
      }
    />

    <hr />

    <Field
      name="isPublic"
      component={CheckboxField}
      onOff
      label={
        <span>
          <FormattedMessage id="app.editExerciseForm.isPublic" defaultMessage="Exercise is public" />
          <Explanation id="isPublicExplanation">
            <FormattedMessage
              id="app.exercise.isPublicExplanation"
              defaultMessage="Public exercise is visible to all supervisors in its home groups and respective nested groups. Private (not public) exercise is visible to the author only."
            />
          </Explanation>
        </span>
      }
    />

    <Field
      name="isLocked"
      component={CheckboxField}
      onOff
      label={
        <span>
          <FormattedMessage id="app.editExerciseForm.isLocked" defaultMessage="Exercise is locked" />
          <Explanation id="isLockedExplanation">
            <FormattedMessage
              id="app.exercise.isLockedExplanation"
              defaultMessage="Locked exercises cannot be assigned in groups. It is recommended to keep the assignment locked until it is properly tested by reference solutions, especially if it is also public."
            />
          </Explanation>
        </span>
      }
    />

    {error && dirty && <Callout variant="danger">{error}</Callout>}
  </FormBox>
);

EditExerciseForm.propTypes = {
  error: PropTypes.any,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
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
        const errors = {};
        if (versionIsUpToDate === false) {
          errors.name = (
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
