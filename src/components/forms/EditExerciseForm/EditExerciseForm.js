import React from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { reduxForm, Field, FieldArray, touch } from 'redux-form';
import {
  injectIntl,
  intlShape,
  FormattedMessage,
  defineMessages
} from 'react-intl';
import { Alert } from 'react-bootstrap';

import {
  TextField,
  SelectField,
  CheckboxField,
  MarkdownTextAreaField
} from '../Fields';

import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';

import { validateExercise } from '../../../redux/modules/exercises';

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
  anyTouched,
  submitting,
  handleSubmit,
  submitFailed: hasFailed,
  submitSucceeded: hasSucceeded,
  invalid,
  asyncValidating,
  formValues: { localizedTexts } = {},
  intl: { formatMessage }
}) => (
  <FormBox
    title={
      <FormattedMessage
        id="app.editExerciseForm.title"
        defaultMessage="Edit exercise {name}"
        values={{ name: exercise.name }}
      />
    }
    succeeded={hasSucceeded}
    dirty={anyTouched}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editExercise"
          invalid={invalid}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={hasSucceeded}
          hasFailed={hasFailed}
          handleSubmit={handleSubmit}
          asyncValidating={asyncValidating}
          messages={{
            submit: (
              <FormattedMessage
                id="app.editExerciseForm.submit"
                defaultMessage="Save changes"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.editExerciseForm.submitting"
                defaultMessage="Saving changes ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.editExerciseForm.success"
                defaultMessage="Settings were saved."
              />
            ),
            validating: (
              <FormattedMessage
                id="app.editExerciseForm.validating"
                defaultMessage="Validating..."
              />
            )
          }}
        />
      </div>
    }
  >
    {hasFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.editExerciseForm.failed"
          defaultMessage="Saving failed. Please try again later."
        />
      </Alert>}

    <Field
      name="name"
      component={TextField}
      label={
        <FormattedMessage
          id="app.editExerciseForm.name"
          defaultMessage="Exercise name:"
        />
      }
    />

    <Field
      name="difficulty"
      component={SelectField}
      options={[
        { key: '', name: '...' },
        { key: 'easy', name: formatMessage(messages.easy) },
        { key: 'medium', name: formatMessage(messages.medium) },
        { key: 'hard', name: formatMessage(messages.hard) }
      ]}
      label={
        <FormattedMessage
          id="app.editExerciseForm.difficulty"
          defaultMessage="Difficulty"
        />
      }
    />

    <Field
      name="description"
      component={MarkdownTextAreaField}
      label={
        <FormattedMessage
          id="app.editExerciseForm.description"
          defaultMessage="Description for supervisors:"
        />
      }
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

    <FieldArray
      name="localizedTexts"
      localizedTexts={localizedTexts}
      component={LocalizedTextsFormField}
    />
  </FormBox>
);

EditExerciseForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  formValues: PropTypes.shape({
    localizedTexts: PropTypes.array
  })
};

const validate = ({ name, description, difficulty, localizedTexts }) => {
  const errors = {};

  if (!name) {
    errors['name'] = (
      <FormattedMessage
        id="app.editExerciseForm.validation.emptyName"
        defaultMessage="Please fill the name of the exercise."
      />
    );
  }

  if (!difficulty) {
    errors['difficulty'] = (
      <FormattedMessage
        id="app.editExerciseForm.validation.difficulty"
        defaultMessage="Please select the difficulty of the exercise."
      />
    );
  }

  if (!description) {
    errors['description'] = (
      <FormattedMessage
        id="app.editExerciseForm.validation.description"
        defaultMessage="Please fill the description of the exercise."
      />
    );
  }

  if (localizedTexts.length < 1) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editExerciseForm.validation.noLocalizedText"
        defaultMessage="Please add at least one localized text describing the exercise."
      />
    );
  }

  const localizedTextsErrors = {};
  for (let i = 0; i < localizedTexts.length; ++i) {
    const localeErrors = {};
    if (!localizedTexts[i]) {
      localeErrors['locale'] = (
        <FormattedMessage
          id="app.editExerciseForm.validation.localizedText"
          defaultMessage="Please fill localized information."
        />
      );
    } else {
      if (!localizedTexts[i].locale) {
        localeErrors['locale'] = (
          <FormattedMessage
            id="app.editExerciseForm.validation.localizedText.locale"
            defaultMessage="Please select the language."
          />
        );
      }

      if (!localizedTexts[i].text) {
        localeErrors['text'] = (
          <FormattedMessage
            id="app.editExerciseForm.validation.localizedText.text"
            defaultMessage="Please fill the description in this language."
          />
        );
      }
    }

    localizedTextsErrors[i] = localeErrors;
  }

  const localeArr = localizedTexts
    .filter(text => text !== undefined)
    .map(text => text.locale);
  for (let i = 0; i < localeArr.length; ++i) {
    const localeErrors = {};
    if (localeArr.indexOf(localeArr[i]) !== i) {
      localeErrors['locale'] = (
        <FormattedMessage
          id="app.editExerciseForm.validation.sameLocalizedTexts"
          defaultMessage="There are more language variants with the same locale. Please make sure locales are unique."
        />
      );
    }
    localizedTextsErrors[i] = localeErrors;
  }
  errors['localizedTexts'] = localizedTextsErrors;

  return errors;
};

const asyncValidate = (values, dispatch, { initialValues: { id, version } }) =>
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
    });

export default injectIntl(
  reduxForm({
    form: 'editExercise',
    validate,
    asyncValidate
  })(EditExerciseForm)
);
