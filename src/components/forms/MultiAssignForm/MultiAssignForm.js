import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert, HelpBlock, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import isNumeric from 'validator/lib/isNumeric';

import { DatetimeField, TextField, CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';
import { getGroupCanonicalLocalizedName } from '../../../helpers/getLocalizedData';

class MultiAssignForm extends Component {
  state = { open: false };
  allGroups = [];
  myGroups = [];

  toggleOpenState = () => {
    this.setState({ open: !this.state.open });
  };

  componentWillReceiveProps(newProps) {
    if (
      this.props.groups !== newProps.groups ||
      this.props.userId !== newProps.userId ||
      this.props.groupsAccessor !== newProps.groupsAccessor ||
      this.props.locale !== newProps.locale
    ) {
      const { groupsAccessor, locale } = newProps;
      this.allGroups = newProps.groups
        .filter(g => !g.organizational)
        .sort((a, b) =>
          getGroupCanonicalLocalizedName(
            a,
            groupsAccessor,
            locale
          ).localeCompare(
            getGroupCanonicalLocalizedName(b, groupsAccessor, locale),
            locale
          )
        );

      this.myGroups = this.allGroups.filter(
        g =>
          g.privateData.admins.find(id => id === newProps.userId) ||
          g.privateData.supervisors.find(id => id === newProps.userId)
      );
    }
  }

  render() {
    const {
      dirty,
      submitting,
      handleSubmit,
      submitFailed: hasFailed,
      submitSucceeded: hasSucceeded,
      invalid,
      reset,
      firstDeadline,
      allowSecondDeadline,
      groupsAccessor,
      locale
    } = this.props;

    return (
      <div>
        {hasFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="generic.savingFailed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        {(this.state.open ? this.allGroups : this.myGroups).map((group, i) =>
          <Field
            key={group.id}
            name={`groups.id${group.id}`}
            component={CheckboxField}
            onOff
            label={getGroupCanonicalLocalizedName(
              group,
              groupsAccessor,
              locale
            )}
          />
        )}

        {this.allGroups.length !== this.myGroups.length &&
          <Button
            bsSize="xs"
            bsStyle="primary"
            className="btn-flat"
            onClick={this.toggleOpenState}
          >
            {this.state.open
              ? <span>
                  <Icon name="minus-square" />&nbsp;&nbsp;
                  <FormattedMessage
                    id="app.multiAssignForm.showMyGroups"
                    defaultMessage="Show My Groups Only"
                  />
                </span>
              : <span>
                  <Icon name="plus-square" />&nbsp;&nbsp;
                  <FormattedMessage
                    id="app.multiAssignForm.showAllGroups"
                    defaultMessage="Show All Groups"
                  />
                </span>}
          </Button>}

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
            dirty={dirty}
            hasSucceeded={hasSucceeded}
            hasFailed={hasFailed}
            handleSubmit={data => handleSubmit(data).then(() => reset())}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.multiAssignForm.submit"
                  defaultMessage="Assign Exercise"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.multiAssignForm.submitting"
                  defaultMessage="Assigning Exercise ..."
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
      </div>
    );
  }
}

MultiAssignForm.propTypes = {
  initialValues: PropTypes.object,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  firstDeadline: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object
  ]), // object == moment.js instance
  allowSecondDeadline: PropTypes.bool,
  userId: PropTypes.string.isRequired,
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
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate
})(MultiAssignForm);
