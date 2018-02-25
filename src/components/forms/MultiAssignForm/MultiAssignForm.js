import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert, HelpBlock } from 'react-bootstrap';
import isNumeric from 'validator/lib/isNumeric';

import { DatetimeField, TextField, CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';
import { getGroupCanonicalLocalizedName } from '../../../helpers/getLocalizedData';

const MultiAssignForm = ({
  anyTouched,
  submitting,
  handleSubmit,
  submitFailed: hasFailed,
  submitSucceeded: hasSucceeded,
  asyncValidating,
  invalid,
  firstDeadline,
  allowSecondDeadline,
  groups,
  groupsAccessor,
  locale
}) =>
  <div>
    {hasFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.multiAssignForm.failed"
          defaultMessage="Saving failed. Please try again later."
        />
      </Alert>}

    {groups
      .sort((a, b) =>
        getGroupCanonicalLocalizedName(a, groupsAccessor, locale).localeCompare(
          getGroupCanonicalLocalizedName(b, groupsAccessor, locale),
          locale
        )
      )
      .map((group, i) =>
        <Field
          key={i}
          name={`groups.${group.id}`}
          component={CheckboxField}
          onOff
          label={getGroupCanonicalLocalizedName(group, groupsAccessor, locale)}
        />
      )}

    <hr />

    <Field
      name="firstDeadline"
      component={DatetimeField}
      label={
        <FormattedMessage
          id="app.multiAssignForm.firstDeadline"
          defaultMessage="First deadline:"
        />
      }
    />

    <Field
      name="maxPointsBeforeFirstDeadline"
      component={TextField}
      label={
        <FormattedMessage
          id="app.multiAssignForm.maxPointsBeforeFirstDeadline"
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
          id="app.multiAssignForm.allowSecondDeadline"
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
            id="app.multiAssignForm.secondDeadline"
            defaultMessage="Second deadline:"
          />
        }
      />}

    {allowSecondDeadline &&
      !firstDeadline &&
      <HelpBlock>
        <FormattedMessage
          id="app.multiAssignForm.chooseFirstDeadlineBeforeSecondDeadline"
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
            id="app.multiAssignForm.maxPointsBeforeSecondDeadline"
            defaultMessage="Maximum amount of points received when submitted before the second deadline:"
          />
        }
      />}

    <Field
      name="submissionsCountLimit"
      component={TextField}
      label={
        <FormattedMessage
          id="app.multiAssignForm.submissionsCountLimit"
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
          id="app.multiAssignForm.canViewLimitRatios"
          defaultMessage="Visibility of memory and time ratios"
        />
      }
    />

    <Field
      name="pointsPercentualThreshold"
      component={TextField}
      label={
        <FormattedMessage
          id="app.multiAssignForm.pointsPercentualThreshold"
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
          id="app.multiAssignForm.isBonus"
          defaultMessage="Assignment is bonus one and points from it are not included in students overall score"
        />
      }
    />

    <div className="text-center">
      <SubmitButton
        id="multiAssignForm"
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
              id="app.multiAssignForm.submit"
              defaultMessage="Assign exercise"
            />
          ),
          submitting: (
            <FormattedMessage
              id="app.multiAssignForm.submitting"
              defaultMessage="Assigning exercise ..."
            />
          ),
          success: (
            <FormattedMessage
              id="app.multiAssignForm.success"
              defaultMessage="Exercise was assigned."
            />
          )
        }}
      />
    </div>
  </div>;

MultiAssignForm.propTypes = {
  initialValues: PropTypes.object,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  firstDeadline: PropTypes.oneOfType([PropTypes.number, PropTypes.object]), // object == moment.js instance
  allowSecondDeadline: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  groups: PropTypes.array.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired
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
  submissionsCountLimit,
  firstDeadline,
  secondDeadline,
  allowSecondDeadline,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline,
  pointsPercentualThreshold,
  groups
}) => {
  const errors = {};

  if (
    !groups ||
    Object.keys(groups).length === 0 ||
    Object.values(groups).filter(val => val).length < 1
  ) {
    errors['_error'] = (
      <FormattedMessage
        id="app.multiAssignForm.validation.emptyGroups"
        defaultMessage="Please select one or more groups to assign exercise."
      />
    );
  }

  if (!firstDeadline) {
    errors['firstDeadline'] = (
      <FormattedMessage
        id="app.multiAssignForm.validation.emptyDeadline"
        defaultMessage="Please fill the date and time of the deadline."
      />
    );
  }

  if (!isPositiveInteger(submissionsCountLimit)) {
    errors['submissionsCountLimit'] = (
      <FormattedMessage
        id="app.multiAssignForm.validation.submissionsCountLimit"
        defaultMessage="Please fill the submissions count limit field with a positive integer."
      />
    );
  }

  if (!isNonNegativeInteger(maxPointsBeforeFirstDeadline)) {
    errors['maxPointsBeforeFirstDeadline'] = (
      <FormattedMessage
        id="app.multiAssignForm.validation.maxPointsBeforeFirstDeadline"
        defaultMessage="Please fill the maximum number of points received when submitted before the deadline with a nonnegative integer."
      />
    );
  }

  if (allowSecondDeadline && !secondDeadline) {
    errors['secondDeadline'] = (
      <FormattedMessage
        id="app.multiAssignForm.validation.secondDeadline"
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
        id="app.multiAssignForm.validation.secondDeadlineBeforeFirstDeadline"
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
        id="app.multiAssignForm.validation.maxPointsBeforeSecondDeadline"
        defaultMessage="Please fill the number of maximu points received after the first and before the second deadline with a nonnegative integer or remove the second deadline."
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
          id="app.multiAssignForm.validation.pointsPercentualThresholdMustBeInteger"
          defaultMessage="Points percentual threshold must be an integer."
        />
      );
    } else if (numericThreshold < 0 || numericThreshold > 100) {
      errors['pointsPercentualThreshold'] = (
        <FormattedMessage
          id="app.multiAssignForm.validation.pointsPercentualThresholdBetweenZeroHundred"
          defaultMessage="Points percentual threshold must be an integer in between 0 and 100."
        />
      );
    }
  }

  return errors;
};

export default reduxForm({
  form: 'multiAssign',
  validate,
  enableReinitialize: true,
  keepDirtyOnReinitialize: false
})(MultiAssignForm);
