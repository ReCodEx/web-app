import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Alert, HelpBlock, Grid, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { defaultMemoize } from 'reselect';

import { WarningIcon } from '../../icons';
import { DatetimeField, CheckboxField, RadioField, NumericTextField } from '../Fields';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import SubmitButton from '../SubmitButton';
import AssignmentFormGroupsList from './AssignmentFormGroupsList';
import AssignmentFormMultiassignSuccess from './AssignmentFormMultiassignSuccess';
import { validateDeadline, validateTwoDeadlines } from '../../helpers/validation';
import {
  getGroupCanonicalLocalizedName,
  getLocalizedTextsInitialValues,
  validateLocalizedTextsFormData,
  transformLocalizedTextsFormData,
} from '../../../helpers/localizedData';
import { safeGet, safeSet, EMPTY_ARRAY } from '../../../helpers/common';

const localizedTextDefaults = {
  name: '',
  text: '',
  link: '',
  studentHint: '',
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
    solutionFilesLimit = null,
    solutionSizeLimit = null,
    canViewLimitRatios = true,
    canViewJudgeStdout = false,
    canViewJudgeStderr = false,
    isBonus = false,
    disabledRuntimeEnvironmentIds = [],
    runtimeEnvironmentIds,
    isPublic = false,
    visibleFrom = null,
  }) => ({
    groups,
    localizedTexts: localizedTexts && getLocalizedTextsInitialValues(localizedTexts, localizedTextDefaults),
    firstDeadline: firstDeadline !== undefined ? moment.unix(firstDeadline) : moment().add(2, 'weeks').endOf('day'),
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
    solutionFilesLimit,
    solutionSizeLimit: solutionSizeLimit && Math.ceil(solutionSizeLimit / 1024), // B -> KiB
    canViewLimitRatios,
    canViewJudgeStdout,
    canViewJudgeStderr,
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
    sendNotification: true,
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
  solutionFilesLimit,
  solutionSizeLimit,
  canViewLimitRatios,
  canViewJudgeStdout,
  canViewJudgeStderr,
  isBonus,
  enabledRuntime,
  visibility,
  visibleFrom,
  sendNotification,
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
    solutionFilesLimit,
    solutionSizeLimit: solutionSizeLimit ? solutionSizeLimit * 1024 : null, // if not null, convert KiB -> B
    canViewLimitRatios,
    canViewJudgeStdout,
    canViewJudgeStderr,
    isBonus,
    disabledRuntimeEnvironmentIds,
    isPublic: visibility !== 'hidden',
    sendNotification,
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
    ),
  },
  {
    key: 'visible',
    name: <FormattedMessage id="app.editAssignmentForm.visibility.visible" defaultMessage="Visible to students" />,
  },
  {
    key: 'visibleFrom',
    name: (
      <FormattedMessage
        id="app.editAssignmentForm.visibility.visibleFrom"
        defaultMessage="Become visible on exact date"
      />
    ),
  },
];

const SUBMIT_BUTTON_MESSAGES_DEFAULT = {
  submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
  submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
  success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
};

const getAllGroups = defaultMemoize((groups, groupsAccessor, locale) =>
  groups && groupsAccessor
    ? groups
        .filter(g => !g.organizational && !g.archived)
        .sort((a, b) =>
          getGroupCanonicalLocalizedName(a, groupsAccessor, locale).localeCompare(
            getGroupCanonicalLocalizedName(b, groupsAccessor, locale),
            locale
          )
        )
    : EMPTY_ARRAY
);

const getUserGroups = defaultMemoize((groups, userId, groupsAccessor, locale) =>
  getAllGroups(groups, groupsAccessor, locale).filter(
    g =>
      safeGet(g, ['primaryAdminsIds', id => id === userId]) ||
      safeGet(g, ['privateData', 'supervisors', id => id === userId])
  )
);

class EditAssignmentForm extends Component {
  state = {
    open: false,
    assignedToGroups: null,
  };

  toggleOpenState = () => {
    this.setState({ open: !this.state.open });
  };

  acknowledgeSuccess = () => {
    this.setState({ assignedToGroups: null });
    this.props.reset();
  };

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
      userId,
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
      warning,
      firstDeadline,
      allowSecondDeadline,
      runtimeEnvironments,
      visibility,
      assignmentIsPublic,
      submitButtonMessages = SUBMIT_BUTTON_MESSAGES_DEFAULT,
      mergeJudgeLogs,
      intl: { locale },
    } = this.props;

    return groups && groupsAccessor && this.state.assignedToGroups !== null ? (
      <AssignmentFormMultiassignSuccess
        assignedToGroups={this.state.assignedToGroups}
        groups={groups}
        groupsAccessor={groupsAccessor}
        acknowledgeSuccess={this.acknowledgeSuccess}
      />
    ) : (
      <React.Fragment>
        {submitFailed && (
          <Alert bsStyle="danger">
            <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
          </Alert>
        )}

        {groupsAccessor && (
          <AssignmentFormGroupsList
            groups={
              this.state.open
                ? getAllGroups(groups, groupsAccessor, locale)
                : getUserGroups(groups, userId, groupsAccessor, locale)
            }
            groupsAccessor={groupsAccessor}
            isOpen={this.state.open}
            toggleOpenState={
              getAllGroups(groups, groupsAccessor, locale).length !==
              getUserGroups(groups, userId, groupsAccessor, locale).length
                ? this.toggleOpenState
                : null
            }
          />
        )}

        <Grid fluid>
          <Row>
            <Col md={6}>
              <Field
                name="firstDeadline"
                component={DatetimeField}
                label={<FormattedMessage id="app.editAssignmentForm.firstDeadline" defaultMessage="First deadline:" />}
              />
            </Col>
            <Col md={6}>
              <NumericTextField
                name="maxPointsBeforeFirstDeadline"
                validateMin={0}
                validateMax={10000}
                maxLength={5}
                label={
                  <FormattedMessage
                    id="app.editAssignmentForm.maxPointsBeforeFirstDeadline"
                    defaultMessage="Maximum amount of points (before the deadline):"
                  />
                }
              />
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
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

          {allowSecondDeadline && (
            <Row>
              <Col md={6}>
                <Field
                  name="secondDeadline"
                  disabled={!firstDeadline || allowSecondDeadline !== true}
                  isValidDate={date => date.isSameOrAfter(firstDeadline)}
                  component={DatetimeField}
                  label={
                    <FormattedMessage id="app.editAssignmentForm.secondDeadline" defaultMessage="Second deadline:" />
                  }
                />
                {!firstDeadline && (
                  <HelpBlock>
                    <FormattedMessage
                      id="app.editAssignmentForm.chooseFirstDeadlineBeforeSecondDeadline"
                      defaultMessage="You must select the date of the first deadline before selecting the date of the second deadline."
                    />
                  </HelpBlock>
                )}
              </Col>
              <Col md={6}>
                <NumericTextField
                  name="maxPointsBeforeSecondDeadline"
                  disabled={allowSecondDeadline !== true}
                  validateMin={0}
                  validateMax={10000}
                  maxLength={5}
                  label={
                    <FormattedMessage
                      id="app.editAssignmentForm.maxPointsBeforeSecondDeadline"
                      defaultMessage="Maximum amount of points (before the second deadline):"
                    />
                  }
                />
              </Col>
            </Row>
          )}
        </Grid>

        <hr />
        <Grid fluid>
          <Row>
            <Col md={6}>
              <NumericTextField
                name="submissionsCountLimit"
                validateMin={1}
                validateMax={100}
                maxLength={3}
                label={
                  <FormattedMessage
                    id="app.editAssignmentForm.submissionsCountLimit"
                    defaultMessage="Submissions count limit:"
                  />
                }
              />
            </Col>
            <Col md={6}>
              <NumericTextField
                name="pointsPercentualThreshold"
                validateMin={0}
                validateMax={100}
                maxLength={3}
                label={
                  <FormattedMessage
                    id="app.editAssignmentForm.pointsPercentualThreshold"
                    defaultMessage="Minimum percentage of points which submissions have to gain:"
                  />
                }
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <NumericTextField
                name="solutionFilesLimit"
                validateMin={1}
                validateMax={100}
                maxLength={3}
                nullable
                label={
                  <FormattedMessage
                    id="app.editAssignmentForm.solutionFilesLimit"
                    defaultMessage="Soluition files limit (if empty, no limit is applied):"
                  />
                }
              />
            </Col>
            <Col md={6}>
              <NumericTextField
                name="solutionSizeLimit"
                validateMin={1}
                validateMax={128 * 1024}
                maxLength={6}
                nullable
                label={
                  <FormattedMessage
                    id="app.editAssignmentForm.solutionSizeLimit"
                    defaultMessage="Soluition total size [KiB] limit (if empty, no limit is applied):"
                  />
                }
              />
            </Col>
          </Row>
        </Grid>

        <br />

        <Grid fluid>
          <Row>
            <Col md={6}>
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
            <Col md={6}>
              <Field
                name="canViewJudgeStdout"
                component={CheckboxField}
                onOff
                label={
                  <FormattedMessage
                    id="app.editAssignmentForm.canViewJudgeStdout"
                    defaultMessage="Visibility of primary logs"
                  />
                }
              />
            </Col>

            {!mergeJudgeLogs && (
              <Col md={6}>
                <Field
                  name="canViewJudgeStderr"
                  component={CheckboxField}
                  onOff
                  label={
                    <FormattedMessage
                      id="app.editAssignmentForm.canViewJudgeStderr"
                      defaultMessage="Visibility of secondary logs"
                    />
                  }
                />
              </Col>
            )}

            <Col md={12}>
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
            {assignment.runtimeEnvironmentIds.map((item, i) => (
              <Col key={i} sm={6}>
                <Field
                  name={`enabledRuntime.${item}`}
                  component={CheckboxField}
                  onOff
                  label={
                    runtimeEnvironments && Array.isArray(runtimeEnvironments) && runtimeEnvironments.length > 0
                      ? runtimeEnvironments.find(env => env.id === item).longName
                      : ''
                  }
                />
              </Col>
            ))}
          </Row>
        </Grid>

        <hr />

        <h4>
          <FormattedMessage id="app.editAssignmentForm.visibility" defaultMessage="Visibility" />
        </h4>
        <Grid fluid>
          <Row>
            <Col md={4}>
              <Field name="visibility" component={RadioField} options={VISIBILITY_STATES} />
            </Col>

            {visibility === 'visibleFrom' && (
              <Col md={8}>
                <Field
                  name="visibleFrom"
                  component={DatetimeField}
                  label={<FormattedMessage id="app.editAssignmentForm.visibleFrom" defaultMessage="Publish date:" />}
                />
              </Col>
            )}
            {visibility === 'visible' && !assignmentIsPublic && (
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
              </Col>
            )}
          </Row>
        </Grid>

        {editTexts && (
          <React.Fragment>
            <hr />

            <div className="callout callout-info">
              <WarningIcon gapRight />
              <FormattedMessage
                id="app.editAssignmentForm.localized.assignmentSyncInfo"
                defaultMessage="Please note that the localized texts are overwritten by actual data from the exercise when exercise update is invoked."
              />
            </div>

            <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="assignment" />
          </React.Fragment>
        )}

        {error && <Alert bsStyle="danger">{error}</Alert>}

        {warning && !error && <Alert bsStyle="warning">{warning}</Alert>}

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
      </React.Fragment>
    );
  }
}

EditAssignmentForm.propTypes = {
  userId: PropTypes.string.isRequired,
  editTexts: PropTypes.bool,
  groups: PropTypes.array,
  groupsAccessor: PropTypes.func,
  alreadyAssignedGroups: PropTypes.array,
  initialValues: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.object,
  warning: PropTypes.object,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  firstDeadline: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]), // object == moment.js instance
  allowSecondDeadline: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  runtimeEnvironments: PropTypes.array,
  visibility: PropTypes.string,
  assignmentIsPublic: PropTypes.bool,
  submitButtonMessages: PropTypes.object,
  mergeJudgeLogs: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const validate = (
  {
    groups,
    localizedTexts,
    firstDeadline,
    secondDeadline,
    allowSecondDeadline,
    runtimeEnvironmentIds,
    enabledRuntime,
    visibility,
    visibleFrom,
  },
  { groupsAccessor, editTexts = false, intl: { formatMessage } }
) => {
  const errors = {};

  if (
    groupsAccessor &&
    (!groups || Object.keys(groups).length === 0 || Object.values(groups).filter(val => val).length < 1)
  ) {
    errors._error = (
      <FormattedMessage
        id="app.editAssignmentForm.validation.emptyGroups"
        defaultMessage="Please select one or more groups to assign exercise."
      />
    );
  }

  if (editTexts) {
    validateLocalizedTextsFormData(errors, localizedTexts, ({ name, text, link }) => {
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
    });
  }

  validateTwoDeadlines(errors, formatMessage, firstDeadline, secondDeadline, allowSecondDeadline);

  const formEnabledRuntimes = (runtimeEnvironmentIds || []).filter(key => enabledRuntime[key]);
  if (formEnabledRuntimes.length === 0) {
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

const warn = ({ groups, canViewJudgeStdout, canViewJudgeStderr }, { groupsAccessor, alreadyAssignedGroups = [] }) => {
  const warnings = {};

  if (canViewJudgeStdout) {
    warnings.canViewJudgeStdout = (
      <FormattedMessage
        id="app.editAssignmentForm.warninigs.canViewJudgeLogs"
        defaultMessage="Allowing the students to see judge logs has its security risks. In case of simple exercises, the students may use this channel to retrieve the test inputs and expected outputs and design a trivial solution which embeds the correct outputs directly into the source code. Use this option wisely."
      />
    );
  }

  if (canViewJudgeStderr) {
    warnings.canViewJudgeStderr = (
      <FormattedMessage
        id="app.editAssignmentForm.warninigs.canViewJudgeLogs"
        defaultMessage="Allowing the students to see judge logs has its security risks. In case of simple exercises, the students may use this channel to retrieve the test inputs and expected outputs and design a trivial solution which embeds the correct outputs directly into the source code. Use this option wisely."
      />
    );
  }

  if (groups && groupsAccessor) {
    let alreadyAssigned = false;
    alreadyAssignedGroups.forEach(id => {
      const key = `id${id}`;
      if (groups[key]) {
        safeSet(
          warnings,
          ['groups', key],
          <FormattedMessage
            id="app.editAssignmentForm.warninigs.alreadyAssigned"
            defaultMessage="The exercise has been already assigned in this group."
          />
        );
        alreadyAssigned = true;
      }
    });

    if (alreadyAssigned) {
      warnings._warning = (
        <FormattedMessage
          id="app.editAssignmentForm.warninigs.alreadyAssignedGlobal"
          defaultMessage="The exercise has been already assigned in some of the selected groups. It will be assigned again."
        />
      );
    }
  }

  return warnings;
};

export default injectIntl(
  reduxForm({
    validate,
    warn,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(EditAssignmentForm)
);
