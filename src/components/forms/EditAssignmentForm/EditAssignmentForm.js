import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray, formValues } from 'redux-form';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Container, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { lruMemoize } from 'reselect';

import { WarningIcon } from '../../icons';
import { DatetimeField, CheckboxField, RadioField, NumericTextField } from '../Fields';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import SubmitButton from '../SubmitButton';
import AssignmentFormGroupsList from './AssignmentFormGroupsList.js';
import AssignmentFormMultiassignSuccess from './AssignmentFormMultiassignSuccess.js';
import InterpolationDialog from './InterpolationDialog.js';
import Explanation from '../../widgets/Explanation';
import Callout from '../../widgets/Callout';
import { validateDeadline, validateTwoDeadlines } from '../../helpers/validation.js';
import {
  getGroupCanonicalLocalizedName,
  getLocalizedTextsInitialValues,
  validateLocalizedTextsFormData,
  transformLocalizedTextsFormData,
} from '../../../helpers/localizedData.js';
import { safeGet, safeSet, EMPTY_ARRAY, hasPermissions } from '../../../helpers/common.js';
import DeadlinesGraphDialog from './DeadlinesGraphDialog.js';

const localizedTextDefaults = {
  name: '',
  text: '',
  link: '',
  studentHint: '',
};

const sanitizeInputNumber = (value, defValue) => {
  const intValue = Number.parseInt(value);
  return Number.isNaN(intValue) ? defValue : intValue;
};

/**
 * Create initial values for the form. It expects one object as input argument.
 * If the object is assignment object, it correctly prepares editing form.
 * If the object holds `groups` property, it prepares multi-assign form.
 */
export const prepareInitialValues = lruMemoize(
  (
    {
      groups = null,
      localizedTexts = null,
      firstDeadline,
      maxPointsBeforeFirstDeadline = 10,
      allowSecondDeadline = false,
      secondDeadline,
      maxPointsBeforeSecondDeadline = 5,
      maxPointsDeadlineInterpolation = false,
      submissionsCountLimit = 50,
      pointsPercentualThreshold = 0,
      solutionFilesLimit = null,
      solutionSizeLimit = null,
      canViewLimitRatios = true,
      canViewMeasuredValues = false,
      canViewJudgeStdout = false,
      canViewJudgeStderr = false,
      isBonus = false,
      isExam = false,
      disabledRuntimeEnvironmentIds = [],
      runtimeEnvironmentIds,
      isPublic = false,
      visibleFrom = null,
    },
    hasNotificationAsyncJob = false
  ) => ({
    groups,
    localizedTexts: localizedTexts && getLocalizedTextsInitialValues(localizedTexts, localizedTextDefaults),
    firstDeadline: firstDeadline !== undefined ? moment.unix(firstDeadline) : moment().add(2, 'weeks').endOf('day'),
    maxPointsBeforeFirstDeadline: sanitizeInputNumber(maxPointsBeforeFirstDeadline, 10),
    secondDeadline: secondDeadline
      ? moment.unix(secondDeadline)
      : firstDeadline !== undefined
        ? moment.unix(firstDeadline).add(2, 'weeks')
        : moment().add(4, 'weeks').endOf('day'),
    maxPointsBeforeSecondDeadline: sanitizeInputNumber(maxPointsBeforeSecondDeadline, 5),
    submissionsCountLimit: sanitizeInputNumber(submissionsCountLimit, 50),
    pointsPercentualThreshold: sanitizeInputNumber(pointsPercentualThreshold, 0),
    solutionFilesLimit,
    solutionSizeLimit: solutionSizeLimit && Math.ceil(solutionSizeLimit / 1024), // B -> KiB
    canViewLimitRatios,
    canViewMeasuredValues,
    canViewJudgeStdout,
    canViewJudgeStderr,
    isBonus,
    isExam,
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
    sendNotification: !isPublic || (visibleFrom && moment().unix() < visibleFrom && hasNotificationAsyncJob),
    deadlines: allowSecondDeadline ? (maxPointsDeadlineInterpolation ? 'interpolated' : 'dual') : 'single',
  })
);

export const transformSubmittedData = ({
  groups = null,
  localizedTexts = null,
  firstDeadline,
  maxPointsBeforeFirstDeadline,
  secondDeadline,
  maxPointsBeforeSecondDeadline,
  submissionsCountLimit,
  pointsPercentualThreshold,
  solutionFilesLimit,
  solutionSizeLimit,
  canViewLimitRatios,
  canViewMeasuredValues,
  canViewJudgeStdout,
  canViewJudgeStderr,
  isBonus,
  isExam,
  enabledRuntime,
  visibility,
  visibleFrom,
  sendNotification,
  deadlines,
}) => {
  const disabledRuntimeEnvironmentIds = enabledRuntime
    ? Object.keys(enabledRuntime).filter(key => enabledRuntime[key] === false)
    : [];

  const allowSecondDeadline = deadlines !== 'single';
  const res = {
    firstDeadline: moment(firstDeadline).unix(),
    maxPointsBeforeFirstDeadline,
    allowSecondDeadline,
    maxPointsDeadlineInterpolation: deadlines === 'interpolated',
    submissionsCountLimit: Number(submissionsCountLimit),
    pointsPercentualThreshold,
    solutionFilesLimit,
    solutionSizeLimit: solutionSizeLimit ? solutionSizeLimit * 1024 : null, // if not null, convert KiB -> B
    canViewLimitRatios,
    canViewMeasuredValues: canViewLimitRatios && canViewMeasuredValues,
    canViewJudgeStdout,
    canViewJudgeStderr,
    isBonus,
    isExam,
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

const DEADLINE_OPTIONS = [
  {
    key: 'single',
    name: (
      <>
        <FormattedMessage id="app.editAssignmentForm.deadlines.single" defaultMessage="Single deadline" />
        <Explanation id="deadlinesSingle">
          <FormattedMessage
            id="app.editAssignmentForm.deadlines.single.explanation"
            defaultMessage="The assignment has only one deadline. Solutions submitted before the deadline are awarded up to given max. points, solutions submitted after the deadline are granted no points."
          />
        </Explanation>
      </>
    ),
  },
  {
    key: 'dual',
    name: (
      <>
        <FormattedMessage id="app.editAssignmentForm.deadlines.dual" defaultMessage="Dual deadlines" />
        <Explanation id="deadlinesDual">
          <FormattedMessage
            id="app.editAssignmentForm.deadlines.dual.explanation"
            defaultMessage="The assignment has two deadlines and two max. points limits. Solutions submitted before the first deadline are awarded points up to the first limit, solutions between the two deadlines are awarded points up to the second limit. No points are granted for solutions after the second deadline."
          />
        </Explanation>
      </>
    ),
  },
  {
    key: 'interpolated',
    name: (
      <>
        <FormattedMessage
          id="app.editAssignmentForm.deadlines.interpolated"
          defaultMessage="Dual deadlines interpolated"
        />
        <Explanation id="deadlinesInterpolation">
          <FormattedMessage
            id="app.editAssignmentForm.deadlines.single.interpolated"
            defaultMessage="The assignment has two deadlines and two max. points limits. Solutions submitted before the first deadline are awarded points up to the first limit. The points limit for the solutions between the two deadlines is computed by linear interpolation between the two point limits. No points are granted for solutions after the second deadline."
          />
        </Explanation>
      </>
    ),
  },
];

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

const getAllGroups = lruMemoize((groups, groupsAccessor, locale) =>
  groups && groupsAccessor
    ? groups
        .filter(g => !g.organizational && !g.archived && hasPermissions(g, 'assignExercise'))
        .sort((a, b) =>
          getGroupCanonicalLocalizedName(a, groupsAccessor, locale).localeCompare(
            getGroupCanonicalLocalizedName(b, groupsAccessor, locale),
            locale
          )
        )
    : EMPTY_ARRAY
);

const getUserGroups = lruMemoize((groups, userId, groupsAccessor, locale) =>
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

  handleInterpolationDialogSubmit = ({ secondDeadlineUnix, maxPointsBeforeSecondDeadline }) => {
    this.props.change('secondDeadline', moment.unix(secondDeadlineUnix));
    this.props.change('maxPointsBeforeSecondDeadline', maxPointsBeforeSecondDeadline);
  };

  selectAllGroups = () => {
    this.clearAllGroups(); // clears really all

    const {
      change,
      groups,
      userId,
      groupsAccessor,
      intl: { locale },
    } = this.props;

    // checks only those visible
    const visibleGroups = this.state.open
      ? getAllGroups(groups, groupsAccessor, locale)
      : getUserGroups(groups, userId, groupsAccessor, locale);

    visibleGroups.forEach(group => {
      change(`groups.id${group.id}`, true);
    });
  };

  clearAllGroups = () => {
    const {
      change,
      groups,
      groupsAccessor,
      intl: { locale },
    } = this.props;

    const visibleGroups = getAllGroups(groups, groupsAccessor, locale);
    visibleGroups.forEach(group => {
      change(`groups.id${group.id}`, false);
    });
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
      deadlines,
      runtimeEnvironments,
      visibility,
      canViewLimitRatios,
      showSendNotification,
      submitButtonMessages = SUBMIT_BUTTON_MESSAGES_DEFAULT,
      mergeJudgeLogs,
      intl: { locale },
    } = this.props;

    const DeadlinesGraphDialogWithValues = formValues({
      firstDeadline: 'firstDeadline',
      secondDeadline: 'secondDeadline',
      maxPointsBeforeFirstDeadline: 'maxPointsBeforeFirstDeadline',
      maxPointsBeforeSecondDeadline: 'maxPointsBeforeSecondDeadline',
      deadlines: 'deadlines',
    })(DeadlinesGraphDialog);

    const InterpolationDialogWithValues = formValues({
      firstDeadline: 'firstDeadline',
      secondDeadline: 'secondDeadline',
      maxPointsBeforeFirstDeadline: 'maxPointsBeforeFirstDeadline',
      maxPointsBeforeSecondDeadline: 'maxPointsBeforeSecondDeadline',
      deadlines: 'deadlines',
    })(InterpolationDialog);

    return groups && groupsAccessor && this.state.assignedToGroups !== null ? (
      <AssignmentFormMultiassignSuccess
        assignedToGroups={this.state.assignedToGroups}
        groups={groups}
        groupsAccessor={groupsAccessor}
        acknowledgeSuccess={this.acknowledgeSuccess}
      />
    ) : (
      <>
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
            selectAllGroupsHandler={this.selectAllGroups}
            clearAllGroupsHandler={this.clearAllGroups}
          />
        )}

        <Container fluid>
          <Row>
            <Col md={6} lg={5} xl={4}>
              <Row>
                <Col xs={6} md={12}>
                  <Field name="deadlines" component={RadioField} options={DEADLINE_OPTIONS} />
                </Col>
                <Col xs={6} md={12}>
                  <DeadlinesGraphDialogWithValues />
                </Col>
              </Row>
            </Col>

            <Col md={6} lg={7} xl={8}>
              <Row>
                <Col sm={6}>
                  <Field
                    name="firstDeadline"
                    component={DatetimeField}
                    label={
                      deadlines === 'single' ? (
                        <>
                          <FormattedMessage id="app.editAssignmentForm.onlyDeadline" defaultMessage="Deadline:" />
                          <Explanation id="onlyDeadlineExplanation">
                            <FormattedMessage
                              id="app.editAssignmentForm.onlyDeadlineExplanation"
                              defaultMessage="Students are expected to submit the solution before this deadline to receive any points. Solutions submitted after the deadline are still evaluated, but they receive no points."
                            />
                          </Explanation>
                        </>
                      ) : (
                        <>
                          <FormattedMessage
                            id="app.editAssignmentForm.firstDeadline"
                            defaultMessage="First deadline:"
                          />
                          <Explanation id="firstDeadlineExplanation">
                            <FormattedMessage
                              id="app.editAssignmentForm.firstDeadlineExplanation"
                              defaultMessage="Students are expected to submit the solution before this deadline to receive full points. Solutions submitted after the first deadline receive lower amount of points."
                            />
                          </Explanation>
                        </>
                      )
                    }
                  />
                </Col>
                <Col sm={6}>
                  <NumericTextField
                    name="maxPointsBeforeFirstDeadline"
                    validateMin={0}
                    validateMax={10000}
                    maxLength={5}
                    label={
                      <>
                        {deadlines === 'single' ? (
                          <FormattedMessage id="app.editAssignmentForm.maxPoints" defaultMessage="Points limit:" />
                        ) : (
                          <FormattedMessage
                            id="app.editAssignmentForm.maxPointsBeforeDeadline"
                            defaultMessage="Points limit ({deadline}):"
                            values={{ deadline: 1 }}
                          />
                        )}
                        <Explanation id="maxPointsExplanation">
                          <FormattedMessage
                            id="app.editAssignmentForm.maxPointsExplanation"
                            defaultMessage="Maximal amount of points received for 100% correct solution submitted before the deadline."
                          />
                        </Explanation>
                      </>
                    }
                  />
                </Col>

                {deadlines !== 'single' && (
                  <>
                    <Col sm={6}>
                      <Field
                        name="secondDeadline"
                        disabled={deadlines === 'single'}
                        component={DatetimeField}
                        label={
                          <>
                            <FormattedMessage
                              id="app.editAssignmentForm.secondDeadline"
                              defaultMessage="Second deadline:"
                            />
                            <Explanation id="secondDeadlineExplanation">
                              <FormattedMessage
                                id="app.editAssignmentForm.secondDeadlineExplanation"
                                defaultMessage="Second deadline is for late solutions which are still awarded some points. Solutions submitted after the second deadline are granted no points."
                              />
                            </Explanation>
                          </>
                        }
                      />
                    </Col>
                    <Col sm={6}>
                      <NumericTextField
                        name="maxPointsBeforeSecondDeadline"
                        disabled={deadlines === 'single'}
                        validateMin={0}
                        validateMax={10000}
                        maxLength={5}
                        append={
                          deadlines === 'interpolated' ? (
                            <InterpolationDialogWithValues onSubmit={this.handleInterpolationDialogSubmit} />
                          ) : null
                        }
                        label={
                          deadlines === 'dual' ? (
                            <>
                              <FormattedMessage
                                id="app.editAssignmentForm.maxPointsBeforeDeadline"
                                defaultMessage="Points limit ({deadline}):"
                                values={{ deadline: 2 }}
                              />
                              <Explanation id="maxPointsSecondDeadlineExplanation">
                                <FormattedMessage
                                  id="app.editAssignmentForm.maxPointsSecondDeadlineExplanation"
                                  defaultMessage="Maximal amount of points received for 100% correct solution submitted after the first, but before the second deadline."
                                />
                              </Explanation>
                            </>
                          ) : (
                            <>
                              <FormattedMessage
                                id="app.editAssignmentForm.maxPointsInterpolationLimit"
                                defaultMessage="Interpolate points to:"
                              />
                              <Explanation id="maxPointsInterpolationLimitExplanation">
                                <FormattedMessage
                                  id="app.editAssignmentForm.maxPointsInterpolationLimitExplanation"
                                  defaultMessage="The actual points limit between the first and the second deadline is interpolated linearly from the first points limit to this limit."
                                />
                              </Explanation>
                            </>
                          )
                        }
                      />
                    </Col>
                  </>
                )}
              </Row>
            </Col>
          </Row>
        </Container>

        <hr />
        <Container fluid>
          <Row>
            <Col md={6}>
              <NumericTextField
                name="submissionsCountLimit"
                validateMin={1}
                validateMax={100}
                maxLength={3}
                label={
                  <>
                    <FormattedMessage
                      id="app.editAssignmentForm.submissionsCountLimit"
                      defaultMessage="Submissions count limit:"
                    />
                    <Explanation id="submissionsCountLimitExplanation">
                      <FormattedMessage
                        id="app.editAssignmentForm.submissionsCountLimitExplanation"
                        defaultMessage="Maximal number of solutions a student may have at any given time. A student is not able to submit more solutions once the limit is reached. However, the supervisor may delete existing solutions to increase the number of submission attempts individually."
                      />
                    </Explanation>
                  </>
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
                  <>
                    <FormattedMessage
                      id="app.editAssignmentForm.pointsPercentThreshold"
                      defaultMessage="Minimal required correctness [%]:"
                    />
                    <Explanation id="pointsPercentualThresholdExplanation">
                      <FormattedMessage
                        id="app.editAssignmentForm.pointsPercentThresholdExplanation"
                        defaultMessage="Minimal solution correctness (expressed in percents) that is required for regular scoring. Solutions below this threshold always gets zero points."
                      />
                    </Explanation>
                  </>
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
                  <span>
                    <FormattedMessage
                      id="app.editExerciseForm.solutionFilesLimit"
                      defaultMessage="Solution files limit:"
                    />
                    <Explanation id="solutionFilesLimitExplanation">
                      <FormattedMessage
                        id="app.exercise.solutionFilesLimitExplanation"
                        defaultMessage="Maximal number of files submitted in a solution. The users are not allowed to submit solutions that exceed this limit. If empty, no limit is applied."
                      />
                    </Explanation>
                  </span>
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
                    </Explanation>
                  </span>
                }
              />
            </Col>
          </Row>
        </Container>

        <br />

        <Container fluid>
          <Row>
            <Col md={6} xl={mergeJudgeLogs ? 4 : 6}>
              <Field
                name="canViewLimitRatios"
                component={CheckboxField}
                onOff
                label={
                  <span>
                    <FormattedMessage
                      id="app.editAssignmentForm.canViewLimitRatios"
                      defaultMessage="Visibility of memory and time"
                    />
                    <Explanation id="canViewLimitRatiosExplanation">
                      <FormattedMessage
                        id="app.editAssignmentForm.canViewLimitRatiosExplanation"
                        defaultMessage="Whether the students can see the measured execution time and consumed memory of their solutions. The measurements are displayed relatively to the established limits, so the students do not see the absolute values but only a percentage."
                      />
                    </Explanation>
                  </span>
                }
              />
            </Col>
            <Col md={6} xl={mergeJudgeLogs ? 4 : 6}>
              <Field
                name="canViewMeasuredValues"
                component={CheckboxField}
                onOff
                disabled={!canViewLimitRatios}
                label={
                  <span>
                    <FormattedMessage
                      id="app.editAssignmentForm.canViewMeasuredValues"
                      defaultMessage="Show absolute measurements"
                    />
                    <Explanation id="canViewMeasuredValuesExplanation">
                      <FormattedMessage
                        id="app.editAssignmentForm.canViewMeasuredValuesExplanation"
                        defaultMessage="Whether the students can see the measured execution time and consumed memory in absolute units (not just as a relative ratio of the test limits)."
                      />
                    </Explanation>
                  </span>
                }
              />
            </Col>
            <Col md={6} xl={mergeJudgeLogs ? 4 : 6}>
              <Field
                name="canViewJudgeStdout"
                component={CheckboxField}
                onOff
                label={
                  mergeJudgeLogs ? (
                    <span>
                      <FormattedMessage
                        id="app.editAssignmentForm.canViewJudgeLogs"
                        defaultMessage="Visibility of judge logs"
                      />
                      <Explanation id="canViewJudgeLogsExplanation">
                        <FormattedMessage
                          id="app.editAssignmentForm.canViewJudgeLogsExplanation"
                          defaultMessage="If set, judge logs are visible to students. Please note that publishing the logs also provides means for the students to access the inputs which may not be desirable for some categories of exercises."
                        />
                      </Explanation>
                    </span>
                  ) : (
                    <span>
                      <FormattedMessage
                        id="app.editAssignmentForm.canViewJudgeStdout"
                        defaultMessage="Visibility of primary logs"
                      />
                      <Explanation id="canViewJudgeStdoutExplanation">
                        <FormattedMessage
                          id="app.editAssignmentForm.canViewJudgeStdoutExplanation"
                          defaultMessage="If set, judge primary logs (stdout) are visible to students. Please note that publishing the logs also provides means for the students to access the inputs which may not be desirable for some categories of exercises."
                        />
                      </Explanation>
                    </span>
                  )
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
                    <span>
                      <FormattedMessage
                        id="app.editAssignmentForm.canViewJudgeStderr"
                        defaultMessage="Visibility of secondary logs"
                      />
                      <Explanation id="canViewJudgeStderrExplanation" placement="top">
                        <FormattedMessage
                          id="app.editAssignmentForm.canViewJudgeStderrExplanation"
                          defaultMessage="If set, judge secondary logs (stderr) are visible to students. Please note that publishing the logs also provides means for the students to access the inputs which may not be desirable for some categories of exercises."
                        />
                      </Explanation>
                    </span>
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
        </Container>

        <hr className="mt-0 mb-4" />

        <Container fluid>
          <Row>
            <Col xs={12}>
              <Field
                name="isExam"
                component={CheckboxField}
                onOff
                label={
                  <>
                    <FormattedMessage id="app.editAssignmentForm.isExam" defaultMessage="Exam assignment" />
                    <Explanation id="isExamExplanation">
                      <FormattedMessage
                        id="app.editAssignmentForm.isExamExplanation"
                        defaultMessage="Exam assignments are secured during examination periods so that they are not visible to students that have not yet lock themselves in the group. Furthermore, if an exam assignment has the deadline synced with the end of the exam, it is updated automatically when the end of exam changes."
                      />
                    </Explanation>
                  </>
                }
              />
            </Col>
          </Row>
        </Container>

        <hr />

        <h4>
          <FormattedMessage
            id="app.editAssignmentForm.enabledEnvironments"
            defaultMessage="Enabled Runtime Environments"
          />
        </h4>

        <Container fluid>
          <Row>
            {assignment.runtimeEnvironmentIds.map((item, i) => (
              <Col key={i} sm={6} lg={4} xl={3}>
                <Field
                  name={`enabledRuntime.${item}`}
                  component={CheckboxField}
                  label={
                    runtimeEnvironments && Array.isArray(runtimeEnvironments) && runtimeEnvironments.length > 0
                      ? runtimeEnvironments.find(env => env.id === item).longName
                      : ''
                  }
                />
              </Col>
            ))}
          </Row>
        </Container>

        <hr />

        <h4>
          <FormattedMessage id="generic.visibility" defaultMessage="Visibility" />
        </h4>
        <Container fluid>
          <Row>
            <Col md={4}>
              <Field name="visibility" component={RadioField} options={VISIBILITY_STATES} />
            </Col>

            <Col md={8}>
              {visibility === 'visibleFrom' && (
                <Field
                  name="visibleFrom"
                  component={DatetimeField}
                  label={<FormattedMessage id="app.editAssignmentForm.visibleFrom" defaultMessage="Publish date:" />}
                />
              )}

              {visibility !== 'hidden' && showSendNotification && (
                <Field
                  name="sendNotification"
                  component={CheckboxField}
                  onOff
                  label={
                    <>
                      <FormattedMessage
                        id="app.editAssignmentForm.sendNotification"
                        defaultMessage="Send e-mail notification to students about new assignment"
                      />

                      {visibility === 'visibleFrom' && (
                        <Explanation id="sendNotificationInFutureExplain">
                          <FormattedMessage
                            id="app.editAssignmentForm.sendNotificationInFutureExplain"
                            defaultMessage="The e-mail will be sent right after the assignment will actually become visible to students."
                          />
                        </Explanation>
                      )}
                    </>
                  }
                />
              )}
            </Col>
          </Row>
        </Container>

        {editTexts && (
          <>
            <hr />

            <Callout variant="info" icon={<WarningIcon />}>
              <FormattedMessage
                id="app.editAssignmentForm.localized.assignmentSyncInfo"
                defaultMessage="Please note that the localized texts (name and complete description) are overwritten by the most recent data from the exercise when update of the assignment is invoked (if the exercise has been modified after the assignment). The only exception is the hint for students which is associated only with the assignment."
              />
            </Callout>

            <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="assignment" />
          </>
        )}

        {error && <Callout variant="danger">{error}</Callout>}

        {warning && !error && <Callout variant="warning">{warning}</Callout>}

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

          {submitFailed && (
            <span className="ms-4 text-danger">
              <WarningIcon gapRight={2} />
              <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
            </span>
          )}
        </div>
      </>
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
  change: PropTypes.func.isRequired,
  deadlines: PropTypes.string,
  runtimeEnvironments: PropTypes.array,
  visibility: PropTypes.string,
  canViewLimitRatios: PropTypes.bool,
  showSendNotification: PropTypes.bool,
  submitButtonMessages: PropTypes.object,
  mergeJudgeLogs: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
};

const validate = (
  {
    groups,
    localizedTexts,
    firstDeadline,
    secondDeadline,
    runtimeEnvironmentIds,
    enabledRuntime,
    visibility,
    visibleFrom,
    deadlines,
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

  validateTwoDeadlines(errors, formatMessage, firstDeadline, secondDeadline, deadlines !== 'single');

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

const warn = (
  {
    firstDeadline,
    deadlines,
    maxPointsBeforeFirstDeadline,
    maxPointsBeforeSecondDeadline,
    groups,
    canViewJudgeStdout,
    canViewJudgeStderr,
  },
  { groupsAccessor, intl: { formatMessage }, alreadyAssignedGroups = [] }
) => {
  const warnings = {};

  if (deadlines !== 'single' && !validateDeadline({}, formatMessage, firstDeadline, 'firstDeadline', null)) {
    warnings.secondDeadline = (
      <FormattedMessage
        id="app.editAssignmentForm.warnings.chooseFirstDeadlineBeforeSecondDeadline"
        defaultMessage="You must select the date of the first deadline before selecting the date of the second deadline."
      />
    );
  }

  if (deadlines !== 'single' && Number.isInteger(maxPointsBeforeSecondDeadline)) {
    if (maxPointsBeforeFirstDeadline === maxPointsBeforeSecondDeadline) {
      warnings.maxPointsBeforeSecondDeadline = (
        <FormattedMessage
          id="app.editAssignmentForm.warnings.pointsAreTheSame"
          defaultMessage="Both points limits are the same, so there is no need for dual-deadline setup."
        />
      );
    } else if (maxPointsBeforeFirstDeadline < maxPointsBeforeSecondDeadline) {
      warnings.maxPointsBeforeSecondDeadline = (
        <FormattedMessage
          id="app.editAssignmentForm.warnings.secondLimitIsGreaterThanFirstLimit"
          defaultMessage="The limit is greater than the first limit which is quite unusual."
        />
      );
    } else if (maxPointsBeforeSecondDeadline === 0) {
      warnings.maxPointsBeforeSecondDeadline =
        deadlines === 'dual' ? (
          <FormattedMessage
            id="app.editAssignmentForm.warnings.secondLimitIsZero"
            defaultMessage="The limit is zero, so there is no need for dual-deadline setup."
          />
        ) : (
          <FormattedMessage
            id="app.editAssignmentForm.warnings.interpolationGoesToZero"
            defaultMessage="The limit will reach zero before the second deadline (see the graph for details)."
          />
        );
    }
  }

  if (canViewJudgeStdout) {
    warnings.canViewJudgeStdout = (
      <FormattedMessage
        id="app.editAssignmentForm.warnings.canViewJudgeLogs"
        defaultMessage="Allowing the students to see judge logs has its security risks. In case of simple exercises, the students may use this channel to retrieve the test inputs and expected outputs and design a trivial solution which embeds the correct outputs directly into the source code. Use this option wisely."
      />
    );
  }

  if (canViewJudgeStderr) {
    warnings.canViewJudgeStderr = (
      <FormattedMessage
        id="app.editAssignmentForm.warnings.canViewJudgeLogs"
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
            id="app.editAssignmentForm.warnings.alreadyAssigned"
            defaultMessage="The exercise has been already assigned in this group."
          />
        );
        alreadyAssigned = true;
      }
    });

    if (alreadyAssigned) {
      warnings._warning = (
        <FormattedMessage
          id="app.editAssignmentForm.warnings.alreadyAssignedGlobal"
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
