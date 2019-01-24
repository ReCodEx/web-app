import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Alert, HelpBlock, Grid, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { defaultMemoize } from 'reselect';

import { DatetimeField, TextField, CheckboxField, RadioField } from '../Fields';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import SubmitButton from '../SubmitButton';
import AssignmentFormGroupsList from './AssignmentFormGroupsList';
import AssignmentFormMultiassignSuccess from './AssignmentFormMultiassignSuccess';
import {
  isNonNegativeInteger,
  isPositiveInteger,
  validateDeadline,
  validateTwoDeadlines
} from '../../helpers/validation';
import {
  getGroupCanonicalLocalizedName,
  getLocalizedTextsInitialValues,
  validateLocalizedTextsFormData,
  transformLocalizedTextsFormData
} from '../../../helpers/localizedData';

const localizedTextDefaults = {
  name: '',
  text: '',
  link: '',
  studentHint: ''
};

/**
 * Create initial values for the form. It expects one object as input argument.
 * If the object is assignment object, it correctly prepares editting form.
 * If the object holds `groups` property, it prepares multi-assign form.
 */
export const prepareInitialValues = defaultMemoize(
  ({
    groups = null,
    localizedTexts = null,
    firstDeadline,
    maxPointsBeforeFirstDeadline = '10',
    allowSecondDeadline = false,
    secondDeadline,
    maxPointsBeforeSecondDeadline = '5',
    submissionsCountLimit = '50',
    pointsPercentualThreshold = '0',
    canViewLimitRatios = true,
    isBonus = false,
    disabledRuntimeEnvironmentIds = [],
    runtimeEnvironmentIds,
    isPublic = false,
    visibleFrom = null
  }) => ({
    groups,
    localizedTexts:
      localizedTexts &&
      getLocalizedTextsInitialValues(localizedTexts, localizedTextDefaults),
    firstDeadline:
      firstDeadline !== undefined
        ? moment.unix(firstDeadline)
        : moment().add(2, 'weeks').endOf('day'),
    maxPointsBeforeFirstDeadline,
    allowSecondDeadline,
    secondDeadline: secondDeadline
      ? moment.unix(secondDeadline)
      : firstDeadline !== undefined
        ? moment.unix(firstDeadline).add(2, 'weeks')
        : moment().add(4, 'weeks').endOf('day'),
    maxPointsBeforeSecondDeadline,
    submissionsCountLimit,
    pointsPercentualThreshold,
    canViewLimitRatios,
    isBonus,
    runtimeEnvironmentIds,
    enabledRuntime: disabledRuntimeEnvironmentIds.reduce(
      (result, item) => {
        result[item] = false;
        return result;
      },
      runtimeEnvironmentIds.reduce((result, item) => {
        result[item] = true;
        return result;
      }, {})
    ),
    visibility: isPublic ? (visibleFrom ? 'visibleFrom' : 'visible') : 'hidden',
    visibleFrom: visibleFrom ? moment.unix(visibleFrom) : moment().endOf('day'),
    sendNotification: true
  })
);

const transformSubmittedData = ({
  groups = null,
  localizedTexts = null,
  firstDeadline,
  maxPointsBeforeFirstDeadline,
  allowSecondDeadline,
  secondDeadline,
  maxPointsBeforeSecondDeadline,
  submissionsCountLimit,
  pointsPercentualThreshold,
  canViewLimitRatios,
  isBonus,
  enabledRuntime,
  visibility,
  visibleFrom,
  sendNotification
}) => {
  const disabledRuntimeEnvironmentIds = enabledRuntime
    ? Object.keys(enabledRuntime).filter(key => enabledRuntime[key] === false)
    : [];

  const res = {
    firstDeadline: moment(firstDeadline).unix(),
    maxPointsBeforeFirstDeadline,
    allowSecondDeadline,
    submissionsCountLimit: Number(submissionsCountLimit),
    pointsPercentualThreshold,
    canViewLimitRatios,
    isBonus,
    disabledRuntimeEnvironmentIds,
    isPublic: visibility !== 'hidden',
    sendNotification
  };

  if (groups) {
    res.groups = Object.keys(groups)
      .filter(key => groups[key])
      .map(id => id.replace(/^id/, ''));
  }
  if (localizedTexts) {
    res.localizedTexts = transformLocalizedTextsFormData(localizedTexts);
  }
  if (allowSecondDeadline) {
    res.secondDeadline = moment(secondDeadline).unix();
    res.maxPointsBeforeSecondDeadline = maxPointsBeforeSecondDeadline;
  }
  if (visibility === 'visibleFrom') {
    res.visibleFrom = moment(visibleFrom).unix();
  }
  return res;
};

const VISIBILITY_STATES = [
  {
    key: 'hidden',
    name: (
      <FormattedMessage
        id="app.editAssignmentForm.visibility.hidden"
        defaultMessage="Hidden (not visible to students)"
      />
    )
  },
  {
    key: 'visible',
    name: (
      <FormattedMessage
        id="app.editAssignmentForm.visibility.visible"
        defaultMessage="Visible to students"
      />
    )
  },
  {
    key: 'visibleFrom',
    name: (
      <FormattedMessage
        id="app.editAssignmentForm.visibility.visibleFrom"
        defaultMessage="Become visible on exact date"
      />
    )
  }
];

const SUBMIT_BUTTON_MESSAGES_DEFAULT = {
  submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
  submitting: (
    <FormattedMessage id="generic.saving" defaultMessage="Saving..." />
  ),
  success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />
};

class EditAssignmentForm extends Component {
  state = {
    open: false,
    assignedToGroups: null
  };
  allGroups = [];
  myGroups = [];

  toggleOpenState = () => {
    this.setState({ open: !this.state.open });
  };

  acknowledgeSuccess = () => {
    this.setState({ assignedToGroups: null });
    this.props.reset();
  };

  componentWillReceiveProps(newProps) {
    if (
      this.props.groups !== newProps.groups ||
      this.props.userId !== newProps.userId ||
      this.props.groupsAccessor !== newProps.groupsAccessor
    ) {
      const { groupsAccessor, intl: { locale } } = newProps;
      this.allGroups = newProps.groups
        .filter(g => !g.organizational && !g.archived)
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
          g.primaryAdminsIds.find(id => id === newProps.userId) ||
          g.privateData.supervisors.find(id => id === newProps.userId)
      );
    }
  }

  /**
   * Wraps the onSubmit callback passed from the parent component.
   * (note that submitHandler in which this function is used is redux-form internal routine to handle submits)
   */
  onSubmitWrapper = formData => {
    const { onSubmit, groupsAccessor = null } = this.props;
    const data = transformSubmittedData(formData);
    if (groupsAccessor) {
      return onSubmit(data).then(() => {
        this.setState({ assignedToGroups: data.groups });
      });
    } else {
      return onSubmit(data);
    }
  };

  render() {
    const {
      groups,
      editTexts = false,
      groupsAccessor = null,
      initialValues: assignment,
      dirty,
      submitting,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      asyncValidating = false,
      invalid,
      error,
      firstDeadline,
      allowSecondDeadline,
      runtimeEnvironments,
      visibility,
      assignmentIsPublic,
      submitButtonMessages = SUBMIT_BUTTON_MESSAGES_DEFAULT
    } = this.props;

    return groups && groupsAccessor && this.state.assignedToGroups !== null
      ? <AssignmentFormMultiassignSuccess
          assignedToGroups={this.state.assignedToGroups}
          groups={groups}
          groupsAccessor={groupsAccessor}
          acknowledgeSuccess={this.acknowledgeSuccess}
        />
      : <React.Fragment>
          {submitFailed &&
            <Alert bsStyle="danger">
              <FormattedMessage
                id="generic.savingFailed"
                defaultMessage="Saving failed. Please try again later."
              />
            </Alert>}

          {editTexts &&
            <FieldArray
              name="localizedTexts"
              component={LocalizedTextsFormField}
              fieldType="assignment"
            />}

          {groupsAccessor &&
            <AssignmentFormGroupsList
              groups={this.state.open ? this.allGroups : this.myGroups}
              groupsAccessor={groupsAccessor}
              isOpen={this.state.open}
              toggleOpenState={
                this.allGroups.length !== this.myGroups.length
                  ? this.toggleOpenState
                  : null
              }
            />}

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
                      defaultMessage="Allow second deadline"
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
              <Col md={5}>
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
              <Col md={7}>
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
                        ? runtimeEnvironments.find(env => env.id === item)
                            .longName
                        : ''
                    }
                  />
                </Col>
              )}
            </Row>
          </Grid>

          <hr />

          <h4>
            <FormattedMessage
              id="app.editAssignmentForm.visibility"
              defaultMessage="Visibility"
            />
          </h4>
          <Grid fluid>
            <Row>
              <Col md={5}>
                <Field
                  name="visibility"
                  component={RadioField}
                  options={VISIBILITY_STATES}
                />

                {false &&
                  <table>
                    <tbody>
                      {Object.keys(VISIBILITY_STATES).map(state =>
                        <tr key={state}>
                          <td className="em-padding valign-middle">
                            <Field
                              name="visibility"
                              component="input"
                              type="radio"
                              value={state}
                            />
                          </td>
                          <td className="valign-middle">
                            {VISIBILITY_STATES[state]}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>}
              </Col>
              {visibility === 'visibleFrom' &&
                <Col md={7}>
                  <Field
                    name="visibleFrom"
                    component={DatetimeField}
                    label={
                      <FormattedMessage
                        id="app.editAssignmentForm.visibleFrom"
                        defaultMessage="Publish date:"
                      />
                    }
                  />
                </Col>}
              {visibility === 'visible' &&
                !assignmentIsPublic &&
                <Col md={6}>
                  <Field
                    name="sendNotification"
                    component={CheckboxField}
                    onOff
                    label={
                      <FormattedMessage
                        id="app.editAssignmentForm.sendNotification"
                        defaultMessage="Send e-mail notification to students about new assignment"
                      />
                    }
                  />
                </Col>}
            </Row>
          </Grid>

          {error &&
            <Alert bsStyle="danger">
              {error}
            </Alert>}

          <div className="text-center">
            <SubmitButton
              id="editAssignmentForm"
              invalid={invalid}
              submitting={submitting}
              dirty={dirty}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit(this.onSubmitWrapper)}
              asyncValidating={asyncValidating}
              messages={submitButtonMessages}
            />
          </div>
        </React.Fragment>;
  }
}

EditAssignmentForm.propTypes = {
  userId: PropTypes.string.isRequired,
  editTexts: PropTypes.bool,
  groups: PropTypes.array,
  groupsAccessor: PropTypes.func,
  initialValues: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.object,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  firstDeadline: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object
  ]), // object == moment.js instance
  allowSecondDeadline: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  runtimeEnvironments: PropTypes.array,
  visibility: PropTypes.string,
  assignmentIsPublic: PropTypes.bool,
  submitButtonMessages: PropTypes.object,
  intl: intlShape.isRequired
};

const validate = (
  {
    groups,
    localizedTexts,
    submissionsCountLimit,
    firstDeadline,
    secondDeadline,
    allowSecondDeadline,
    maxPointsBeforeFirstDeadline,
    maxPointsBeforeSecondDeadline,
    pointsPercentualThreshold,
    runtimeEnvironmentIds,
    enabledRuntime,
    visibility,
    visibleFrom
  },
  { groupsAccessor, editTexts = false, intl: { formatMessage } }
) => {
  const errors = {};

  if (
    groupsAccessor &&
    (!groups ||
      Object.keys(groups).length === 0 ||
      Object.values(groups).filter(val => val).length < 1)
  ) {
    errors._error = (
      <FormattedMessage
        id="app.multiAssignForm.validation.emptyGroups"
        defaultMessage="Please select one or more groups to assign exercise."
      />
    );
  }

  if (editTexts) {
    validateLocalizedTextsFormData(
      errors,
      localizedTexts,
      ({ name, text, link }) => {
        const textErrors = {};
        if (!name.trim()) {
          textErrors.name = (
            <FormattedMessage
              id="app.editAssignmentForm.validation.emptyName"
              defaultMessage="Please fill the name of the assignment."
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
      }
    );
  }

  validateTwoDeadlines(
    errors,
    formatMessage,
    firstDeadline,
    secondDeadline,
    allowSecondDeadline
  );

  if (!isPositiveInteger(submissionsCountLimit)) {
    errors.submissionsCountLimit = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.submissionsCountLimit"
        defaultMessage="Please fill the submissions count limit field with a positive integer."
      />
    );
  }

  if (!isNonNegativeInteger(maxPointsBeforeFirstDeadline)) {
    errors.maxPointsBeforeFirstDeadline = (
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
    errors.maxPointsBeforeSecondDeadline = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.maxPointsBeforeSecondDeadline"
        defaultMessage="Please fill the number of maximum points received after the first and before the second deadline with a nonnegative integer or remove the second deadline."
      />
    );
  }

  if (pointsPercentualThreshold) {
    const numericThreshold = Number(pointsPercentualThreshold);
    if (numericThreshold < 0 || numericThreshold > 100) {
      errors.pointsPercentualThreshold = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.pointsPercentualThresholdBetweenZeroHundred"
          defaultMessage="Points percentual threshold must be in between 0 and 100."
        />
      );
    }
  }

  const formDisabledRuntimes = Object.keys(enabledRuntime).filter(
    key => enabledRuntime[key] === false
  );
  if (formDisabledRuntimes.length === runtimeEnvironmentIds.length) {
    errors._error = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.allRuntimesDisabled"
        defaultMessage="You cannot disable all available runtime environments."
      />
    );
  }

  if (visibility === 'visibleFrom') {
    validateDeadline(errors, formatMessage, visibleFrom, 'visibleFrom', null); // null - no max. future limit
  }

  return errors;
};

export default injectIntl(
  reduxForm({
    validate,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false
  })(EditAssignmentForm)
);
