import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert, HelpBlock, Grid, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import isNumeric from 'validator/lib/isNumeric';

import FormBox from '../../widgets/FormBox';
import { DatetimeField, TextField, CheckboxField } from '../Fields';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import SubmitButton from '../SubmitButton';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';

const EditAssignmentForm = ({
  initialValues: assignment,
  dirty,
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
  asyncValidating,
  invalid,
  error,
  firstDeadline,
  allowSecondDeadline,
  localizedTextsLocales,
  runtimeEnvironments,
  beingPublished
}) =>
  <div>
    <FormBox
      title={
        <FormattedMessage
          id="app.editAssignmentForm.title"
          defaultMessage="Edit assignment {name}"
          values={{ name: <LocalizedExerciseName entity={assignment} /> }}
        />
      }
      successful={submitSucceeded}
      dirty={dirty}
      unlimitedHeight
      footer={
        <div className="text-center">
          <SubmitButton
            id="editAssignmentForm"
            invalid={invalid}
            submitting={submitting}
            dirty={dirty}
            hasSucceeded={submitSucceeded}
            hasFailed={submitFailed}
            handleSubmit={handleSubmit}
            asyncValidating={asyncValidating}
            messages={{
              submit: (
                <FormattedMessage id="generic.save" defaultMessage="Save" />
              ),
              submitting: (
                <FormattedMessage
                  id="generic.saving"
                  defaultMessage="Saving ..."
                />
              ),
              success: (
                <FormattedMessage id="generic.saved" defaultMessage="Saved" />
              )
            }}
          />
        </div>
      }
    >
      {submitFailed &&
        <Alert bsStyle="danger">
          <FormattedMessage
            id="generic.savingFailed"
            defaultMessage="Saving failed. Please try again later."
          />
        </Alert>}

      {error &&
        <Alert bsStyle="danger">
          {error}
        </Alert>}

      <FieldArray
        name="localizedTexts"
        localizedTextsLocales={localizedTextsLocales}
        component={LocalizedTextsFormField}
        fieldType="assignment"
      />

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
        parse={value => Number(value)}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.maxPointsBeforeFirstDeadline"
            defaultMessage="Maximum amount of points received when submitted before the deadline:"
          />
        }
      />

      <Grid fluid>
        <Row>
          <Col sm={6}>
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
          </Col>
        </Row>
      </Grid>

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
          parse={value => Number(value)}
          label={
            <FormattedMessage
              id="app.editAssignmentForm.maxPointsBeforeSecondDeadline"
              defaultMessage="Maximum amount of points received when submitted before the second deadline:"
            />
          }
        />}

      <hr />

      <Field
        name="submissionsCountLimit"
        component={TextField}
        parse={value => Number(value)}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.submissionsCountLimit"
            defaultMessage="Submissions count limit:"
          />
        }
      />

      <Field
        name="pointsPercentualThreshold"
        component={TextField}
        parse={value => Number(value)}
        label={
          <FormattedMessage
            id="app.editAssignmentForm.pointsPercentualThreshold"
            defaultMessage="Minimum percentage of points which submissions have to gain:"
          />
        }
      />

      <br />

      <Grid fluid>
        <Row>
          <Col sm={6}>
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
          </Col>
          <Col sm={6}>
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
          </Col>
        </Row>
      </Grid>

      <hr />

      <h4>
        <FormattedMessage
          id="app.editAssignmentForm.enabledEnvironments"
          defaultMessage="Enabled Runtime Environments"
        />
      </h4>
      <br />

      <Grid fluid>
        <Row>
          {assignment.runtimeEnvironmentIds.map((item, i) =>
            <Col key={i} sm={6}>
              <Field
                name={`enabledRuntime.${item}`}
                component={CheckboxField}
                onOff
                label={
                  runtimeEnvironments &&
                  Array.isArray(runtimeEnvironments) &&
                  runtimeEnvironments.length > 0
                    ? runtimeEnvironments.find(env => env.id === item).longName
                    : ''
                }
              />
            </Col>
          )}
        </Row>
      </Grid>

      <hr />
      <br />

      <Grid fluid>
        <Row>
          <Col sm={6}>
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
          </Col>
          {beingPublished &&
            <Col sm={6}>
              <Field
                name="sendNotification"
                component={CheckboxField}
                onOff
                label={
                  <FormattedMessage
                    id="app.editAssignmentForm.sendNotification"
                    defaultMessage="Send e-mail notification to students"
                  />
                }
              />
            </Col>}
        </Row>
      </Grid>
    </FormBox>
  </div>;

EditAssignmentForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  firstDeadline: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // object == moment.js instance
  allowSecondDeadline: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  localizedTextsLocales: PropTypes.array,
  runtimeEnvironments: PropTypes.array,
  beingPublished: PropTypes.bool,
  error: PropTypes.object
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
  pointsPercentualThreshold,
  runtimeEnvironmentIds,
  enabledRuntime
}) => {
  const errors = {};

  if (localizedTexts.length < 1) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.noLocalizedText"
        defaultMessage="Please add at least one localized text describing the assignment."
      />
    );
  }

  const localizedTextsErrors = {};
  for (let i = 0; i < localizedTexts.length; ++i) {
    const localeErrors = {};
    if (!localizedTexts[i]) {
      localeErrors['locale'] = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.localizedText"
          defaultMessage="Please fill localized information."
        />
      );
    } else {
      if (!localizedTexts[i].name) {
        localeErrors['name'] = (
          <FormattedMessage
            id="app.editAssignmentForm.validation.emptyName"
            defaultMessage="Please fill the name of the assignment."
          />
        );
      }

      if (!localizedTexts[i].locale) {
        localeErrors['locale'] = (
          <FormattedMessage
            id="app.editAssignmentForm.validation.localizedText.locale"
            defaultMessage="Please select the language."
          />
        );
      }

      if (!localizedTexts[i].text && !localizedTexts[i].link) {
        localeErrors['text'] = (
          <FormattedMessage
            id="app.editAssignmentForm.validation.localizedText.text"
            defaultMessage="Please fill the description in this language or provide an external link below."
          />
        );
      }
    }

    if (Object.keys(localeErrors).length > 0) {
      localizedTextsErrors[i] = localeErrors;
    }
  }

  const localeArr = localizedTexts
    .filter(text => text !== undefined)
    .map(text => text.locale);
  for (let i = 0; i < localeArr.length; ++i) {
    if (localeArr.indexOf(localeArr[i]) !== i) {
      if (localizedTextsErrors[i] && !localizedTextsErrors[i].locale) {
        if (!localizedTextsErrors[i]) {
          localizedTextsErrors[i] = {};
        }
        localizedTextsErrors[i].locale = (
          <FormattedMessage
            id="app.editAssignmentForm.validation.sameLocalizedTexts"
            defaultMessage="There are more language variants with the same locale. Please make sure locales are unique."
          />
        );
      }
    }
  }

  if (Object.keys(localizedTextsErrors).length > 0) {
    errors['localizedTexts'] = localizedTextsErrors;
  }

  const deadlineFutureLimit = moment().endOf('year').add(1, 'year');

  if (!firstDeadline) {
    errors.firstDeadline = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.emptyDeadline"
        defaultMessage="Please fill the date and time of the deadline."
      />
    );
  } else if (!moment.isMoment(firstDeadline)) {
    errors.firstDeadline = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.invalidDateTime"
        defaultMessage="Invalid date or time format."
      />
    );
  } else if (deadlineFutureLimit.isSameOrBefore(firstDeadline)) {
    errors.firstDeadline = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.deadlineInFarFuture"
        defaultMessage="The deadline is too far in the future. At present, the furthest possible deadline is {deadlineFutureLimit, date} {deadlineFutureLimit, time, short}."
        values={{ deadlineFutureLimit }}
      />
    );
  }

  if (allowSecondDeadline) {
    if (!secondDeadline) {
      errors['secondDeadline'] = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.secondDeadline"
          defaultMessage="Please fill the date and time of the second deadline."
        />
      );
    } else if (!moment.isMoment(secondDeadline)) {
      errors['secondDeadline'] = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.invalidDateTime"
          defaultMessage="Invalid date or time format."
        />
      );
    } else if (deadlineFutureLimit.isSameOrBefore(secondDeadline)) {
      errors['secondDeadline'] = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.deadlineInFarFuture"
          defaultMessage="The deadline is too far in the future. At present, the furthest possible deadline is {deadlineFutureLimit, date} {deadlineFutureLimit, time, short}."
          values={{ deadlineFutureLimit }}
        />
      );
    } else if (
      !errors.firstDeadline &&
      !firstDeadline.isSameOrBefore(secondDeadline) &&
      !firstDeadline.isSameOrBefore(secondDeadline, 'hour')
    ) {
      errors['secondDeadline'] = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.secondDeadlineBeforeFirstDeadline"
          defaultMessage="The second deadline is before the first deadline. Please set the second deadline after {firstDeadline, date} {firstDeadline, time, short}."
          values={{ firstDeadline }}
        />
      );
    }
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

  if (
    allowSecondDeadline &&
    !isNonNegativeInteger(maxPointsBeforeSecondDeadline)
  ) {
    errors['maxPointsBeforeSecondDeadline'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.maxPointsBeforeSecondDeadline"
        defaultMessage="Please fill the number of maximum points received after the first and before the second deadline with a nonnegative integer or remove the second deadline."
      />
    );
  }

  if (pointsPercentualThreshold) {
    const numericThreshold = Number(pointsPercentualThreshold);
    if (
      pointsPercentualThreshold.toString() !==
      Math.round(numericThreshold).toString()
    ) {
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

  const formDisabledRuntimes = Object.keys(enabledRuntime).filter(
    key => enabledRuntime[key] === false
  );
  if (formDisabledRuntimes.length === runtimeEnvironmentIds.length) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.allRuntimesDisabled"
        defaultMessage="You cannot disable all available runtime environments."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'editAssignment',
  validate,
  enableReinitialize: true,
  keepDirtyOnReinitialize: false
})(EditAssignmentForm);
