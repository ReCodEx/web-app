import React from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { reduxForm, Field, FieldArray, touch } from 'redux-form';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { Alert, HelpBlock } from 'react-bootstrap';
import isNumeric from 'validator/lib/isNumeric';

import FormBox from '../../widgets/FormBox';
import {
  DatetimeField,
  TextField,
  CheckboxField,
  SourceCodeField
} from '../Fields';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import SubmitButton from '../SubmitButton';

import { validateAssignment } from '../../../redux/modules/assignments';

if (canUseDOM) {
  require('codemirror/mode/yaml/yaml');
}

const EditAssignmentForm = ({
  initialValues: assignment,
  anyTouched,
  submitting,
  handleSubmit,
  submitFailed: hasFailed,
  submitSucceeded: hasSucceeded,
  asyncValidating,
  invalid,
  formValues: { firstDeadline, allowSecondDeadline, localizedTexts } = {}
}) => (
  <div>
    <FormBox
      title={
        <FormattedMessage
          id="app.editAssignmentForm.title"
          defaultMessage="Edit assignment {name}"
          values={{ name: assignment.name }}
        />
      }
      successful={hasSucceeded}
      dirty={anyTouched}
      unlimitedHeight
      footer={
        <div className="text-center">
          <SubmitButton
            id="editAssignmentForm"
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
                  id="app.editAssignmentForm.submit"
                  defaultMessage="Save settings"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editAssignmentForm.submitting"
                  defaultMessage="Saving changes ..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editAssignmentForm.success"
                  defaultMessage="Settings were saved."
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
            id="app.editAssignmentForm.failed"
            defaultMessage="Saving failed. Please try again later."
          />
        </Alert>}

      <Field
        name="name"
        component={TextField}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.name"
            defaultMessage="Assignment default name:"
          />
        }
      />

      <Field
        name="isPublic"
        component={CheckboxField}
        onOff
        label={
          <FormattedMessage
            id="app.editAssignmentForm.isPublic"
            defaultMessage="Visible to students"
          />
        }
      />

      <FieldArray
        name="localizedTexts"
        localizedTexts={localizedTexts}
        component={LocalizedTextsFormField}
      />

      <Field
        name="scoreConfig"
        component={SourceCodeField}
        mode="yaml"
        label={
          <FormattedMessage
            id="app.editAssignmentForm.scoreConfig"
            defaultMessage="Score configuration:"
          />
        }
      />
      <HelpBlock>
        <FormattedHTMLMessage
          id="app.editAssignmentForm.moreAboutScoreConfig"
          defaultMessage="Read more about <a href='https://github.com/ReCodEx/wiki/wiki/Assignments#scoring'>score configuration</a> syntax."
        />
      </HelpBlock>

      <Field
        name="firstDeadline"
        component={DatetimeField}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.firstDeadline"
            defaultMessage="First deadline:"
          />
        }
      />

      <Field
        name="maxPointsBeforeFirstDeadline"
        component={TextField}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.maxPointsBeforeFirstDeadline"
            defaultMessage="Maximum amount of points received when submitted before the deadline:"
          />
        }
      />

      <Field
        name="allowSecondDeadline"
        component={CheckboxField}
        onOff
        label={
          <FormattedMessage
            id="app.editAssignmentForm.allowSecondDeadline"
            defaultMessage="Allow second deadline."
          />
        }
      />

      {allowSecondDeadline &&
        <Field
          name="secondDeadline"
          disabled={!firstDeadline || allowSecondDeadline !== true}
          isValidDate={date => date.isSameOrAfter(firstDeadline)}
          component={DatetimeField}
          label={
            <FormattedMessage
              id="app.editAssignmentForm.secondDeadline"
              defaultMessage="Second deadline:"
            />
          }
        />}

      {allowSecondDeadline &&
        !firstDeadline &&
        <HelpBlock>
          <FormattedMessage
            id="app.editAssignmentForm.chooseFirstDeadlineBeforeSecondDeadline"
            defaultMessage="You must select the date of the first deadline before selecting the date of the second deadline."
          />
        </HelpBlock>}

      {allowSecondDeadline &&
        <Field
          name="maxPointsBeforeSecondDeadline"
          disabled={allowSecondDeadline !== true}
          component={TextField}
          label={
            <FormattedMessage
              id="app.editAssignmentForm.maxPointsBeforeSecondDeadline"
              defaultMessage="Maximum amount of points received when submitted before the second deadline:"
            />
          }
        />}

      <Field
        name="submissionsCountLimit"
        component={TextField}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.submissionsCountLimit"
            defaultMessage="Submissions count limit:"
          />
        }
      />

      <Field
        name="canViewLimitRatios"
        component={CheckboxField}
        onOff
        label={
          <FormattedMessage
            id="app.editAssignmentForm.canViewLimitRatios"
            defaultMessage="Visibility of memory and time ratios"
          />
        }
      />

      <Field
        name="pointsPercentualThreshold"
        component={TextField}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.pointsPercentualThreshold"
            defaultMessage="Minimum percentage of points which submissions have to gain:"
          />
        }
      />

      <Field
        name="isBonus"
        component={CheckboxField}
        onOff
        label={
          <FormattedMessage
            id="app.editAssignmentForm.isBonus"
            defaultMessage="Assignment is bonus one and points from it are not included in students overall score"
          />
        }
      />

    </FormBox>
  </div>
);

EditAssignmentForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  formValues: PropTypes.shape({
    firstDeadline: PropTypes.oneOfType([PropTypes.number, PropTypes.object]), // object == moment.js instance
    allowSecondDeadline: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string
    ]),
    localizedTexts: PropTypes.array
  })
};

const isNonNegativeInteger = n =>
  typeof n !== 'undefined' &&
  (typeof n === 'number' || isNumeric(n)) &&
  parseInt(n) >= 0;

const isPositiveInteger = n =>
  typeof n !== 'undefined' &&
  (typeof n === 'number' || isNumeric(n)) &&
  parseInt(n) > 0;

const validate = ({
  name,
  localizedTexts,
  submissionsCountLimit,
  firstDeadline,
  secondDeadline,
  allowSecondDeadline,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline,
  pointsPercentualThreshold
}) => {
  const errors = {};

  if (!name) {
    errors['name'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.emptyName"
        defaultMessage="Please fill the name of the assignment."
      />
    );
  }

  const localizedTextsErrors = {};
  for (let i = 0; i < localizedTexts.length; ++i) {
    const localeErros = {};
    if (!localizedTexts[i]) {
      localeErros['locale'] = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.localizedText"
          defaultMessage="Please fill localized information."
        />
      );
    } else {
      if (!localizedTexts[i].locale) {
        localeErros['locale'] = (
          <FormattedMessage
            id="app.editAssignmentForm.validation.localizedText.locale"
            defaultMessage="Please select the language."
          />
        );
      }

      if (!localizedTexts[i].text) {
        localeErros['text'] = (
          <FormattedMessage
            id="app.editAssignmentForm.validation.localizedText.text"
            defaultMessage="Please fill the description in this language."
          />
        );
      }
    }

    localizedTextsErrors[i] = localeErros;
  }

  errors['localizedTexts'] = localizedTextsErrors;

  if (!firstDeadline) {
    errors['firstDeadline'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.emptyDeadline"
        defaultMessage="Please fill the date and time of the deadline."
      />
    );
  }

  if (!isPositiveInteger(submissionsCountLimit)) {
    errors['submissionsCountLimit'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.submissionsCountLimit"
        defaultMessage="Please fill the submissions count limit field with a positive integer."
      />
    );
  }

  if (!isNonNegativeInteger(maxPointsBeforeFirstDeadline)) {
    errors['maxPointsBeforeFirstDeadline'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.maxPointsBeforeFirstDeadline"
        defaultMessage="Please fill the maximum number of points received when submitted before the deadline with a nonnegative integer."
      />
    );
  }

  if (allowSecondDeadline && !secondDeadline) {
    errors['secondDeadline'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.secondDeadline"
        defaultMessage="Please fill the date and time of the second deadline."
      />
    );
  }

  if (
    allowSecondDeadline &&
    firstDeadline &&
    secondDeadline &&
    !firstDeadline.isSameOrBefore(secondDeadline) &&
    !firstDeadline.isSameOrBefore(secondDeadline, 'hour')
  ) {
    errors['secondDeadline'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.secondDeadlineBeforeFirstDeadline"
        defaultMessage="Please fill the date and time of the second deadline with a value which is after {firstDeadline, date} {firstDeadline, time, short}."
        values={{ firstDeadline }}
      />
    );
  }

  if (
    allowSecondDeadline &&
    !isNonNegativeInteger(maxPointsBeforeSecondDeadline)
  ) {
    errors['maxPointsBeforeSecondDeadline'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.maxPointsBeforeSecondDeadline"
        defaultMessage="Please fill the number of maximu points received after the first and before the second deadline with a nonnegative integer or remove the second deadline."
      />
    );
  }

  if (pointsPercentualThreshold) {
    const numericThreshold = Number(pointsPercentualThreshold);
    if (pointsPercentualThreshold !== Math.round(numericThreshold).toString()) {
      errors['pointsPercentualThreshold'] = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.pointsPercentualThresholdMustBeInteger"
          defaultMessage="Points percentual threshold must be an integer."
        />
      );
    } else if (numericThreshold < 0 || numericThreshold > 100) {
      errors['pointsPercentualThreshold'] = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.pointsPercentualThresholdBetweenZeroHundred"
          defaultMessage="Points percentual threshold must be an integer in between 0 and 100."
        />
      );
    }
  }

  return errors;
};

const asyncValidate = (values, dispatch, { assignment: { id, version } }) =>
  dispatch(validateAssignment(id, version))
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
        dispatch(touch('editAssignment', 'name'));
      }

      if (Object.keys(errors).length > 0) {
        throw errors;
      }
    });

export default reduxForm({
  form: 'editAssignment',
  validate,
  asyncValidate
})(EditAssignmentForm);
