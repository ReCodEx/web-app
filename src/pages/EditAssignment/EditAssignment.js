import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset, formValueSelector, SubmissionError } from 'redux-form';
import moment from 'moment';

import Page from '../../components/layout/Page';
import { AssignmentNavigation } from '../../components/layout/Navigation';
import EditAssignmentForm, {
  prepareInitialValues as prepareEditFormInitialValues,
} from '../../components/forms/EditAssignmentForm';
import EditAssignmentLocalizedTextsForm, {
  prepareInitialValues as prepareEditLocalizedTextsInitialValues,
} from '../../components/forms/EditAssignmentLocalizedTextsForm';
import DeleteAssignmentButtonContainer from '../../containers/DeleteAssignmentButtonContainer';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import Icon, { EditAssignmentIcon } from '../../components/icons';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import { loggedInUserIdSelector } from '../../redux/selectors/auth.js';
import {
  fetchAssignment,
  editAssignment,
  editAssignmentLocalizedTexts,
  syncWithExercise,
  validateAssignment,
  fetchAssignmentAsyncJobs,
} from '../../redux/modules/assignments.js';
import {
  getAssignment,
  getFetchAssignmentAsyncJobsPending,
  hasPendingNotificationAsyncJob,
} from '../../redux/selectors/assignments.js';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { ResubmitAllSolutionsContainer } from '../../containers/ResubmitSolutionContainer';
import AssignmentSync from '../../components/Assignments/Assignment/AssignmentSync';
import { hasPermissions } from '../../helpers/common.js';

import withLinks from '../../helpers/withLinks.js';
import { withRouterProps } from '../../helpers/withRouter.js';

const showSendNotification = (assignment, visibility, visibleFrom) => {
  const isCurrentlyVisible =
    assignment.isPublic && (!assignment.visibleFrom || assignment.visibleFrom * 1000 <= Date.now());
  const willBecomeVisible = visibility !== 'hidden';
  const willBeVisibleInFuture =
    visibility === 'visibleFrom' && moment.isMoment(visibleFrom) && moment().unix() < visibleFrom.unix();

  // either transitions from hidden to visible, or is visible now and will be hidden + scheduled for later
  return isCurrentlyVisible ? willBeVisibleInFuture : willBecomeVisible;
};

class EditAssignment extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.assignmentId !== prevProps.params.assignmentId) {
      this.props.reset();
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchAssignment(assignmentId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchAssignmentAsyncJobs(assignmentId)),
    ]);

  editAssignmentSubmitHandler = formData => {
    const { assignment, editAssignment, validateAssignment } = this.props;
    const version = assignment.getIn(['data', 'version']);

    // validate assignment version
    return validateAssignment(version)
      .then(res => res.value)
      .then(({ versionIsUpToDate }) => {
        if (versionIsUpToDate === false) {
          throw new SubmissionError({
            _error: (
              <FormattedMessage
                id="app.editAssignment.validation.versionDiffers"
                defaultMessage="Somebody has changed the assignment while you have been editing it. Please reload the page and apply your changes once more."
              />
            ),
          });
        }
      })
      .then(() => editAssignment({ ...formData, version }));
  };

  editLocalizedTextsSubmitHandler = formData => {
    const { assignment, editAssignmentLocalizedTexts, validateAssignment } = this.props;
    const version = assignment.getIn(['data', 'version']);

    // validate assignment version
    return validateAssignment(version)
      .then(res => res.value)
      .then(({ versionIsUpToDate }) => {
        if (versionIsUpToDate === false) {
          throw new SubmissionError({
            _error: (
              <FormattedMessage
                id="app.editAssignment.validation.versionDiffers"
                defaultMessage="Somebody has changed the assignment while you have been editing it. Please reload the page and apply your changes once more."
              />
            ),
          });
        }
      })
      .then(() => editAssignmentLocalizedTexts({ ...formData, version }));
  };

  render() {
    const {
      links: { GROUP_ASSIGNMENTS_URI_FACTORY },
      params: { assignmentId },
      navigate,
      assignment,
      asyncJobsLoading = false,
      hasNotificationAsyncJob = false,
      userId,
      deadlines,
      exerciseSync,
      runtimeEnvironments,
      visibility,
      visibleFrom,
      canViewLimitRatios,
    } = this.props;

    return (
      <Page
        resource={assignment}
        forceLoading={asyncJobsLoading}
        icon={<EditAssignmentIcon />}
        title={<FormattedMessage id="app.editAssignment.title" defaultMessage="Edit Assignment Settings" />}>
        {assignment =>
          assignment && (
            <>
              <AssignmentNavigation
                assignmentId={assignment.id}
                groupId={assignment.groupId}
                exerciseId={assignment.exerciseId}
                canEdit={hasPermissions(assignment, 'update')}
                canViewSolutions={hasPermissions(assignment, 'viewAssignmentSolutions')}
                canViewExercise={true}
              />

              {hasPermissions(assignment, 'resubmitSolutions') && (
                <Row>
                  <Col xs={12}>
                    <div className="mb-3">
                      <ResubmitAllSolutionsContainer assignmentId={assignment.id} />
                    </div>
                  </Col>
                </Row>
              )}

              {assignment.exerciseId && hasPermissions(assignment, 'update') && (
                <AssignmentSync syncInfo={assignment.exerciseSynchronizationInfo} exerciseSync={exerciseSync} />
              )}

              {!assignment.exerciseId && hasPermissions(assignment, 'update') && (
                <Callout variant="warning">
                  <h3 className="m-0 ">
                    <Icon icon="ghost" gapRight={2} />
                    <FormattedMessage
                      id="app.assignment.exerciseDeleted"
                      defaultMessage="Corresponding exercise has been deleted."
                    />
                  </h3>
                  <p className="mt-2">
                    <FormattedMessage
                      id="app.assignment.exerciseDeletedInfo"
                      defaultMessage="The assignment may no longer be synchronized with the exercise and no more assignments of this exercise may be created."
                    />
                  </p>
                </Callout>
              )}

              <Box
                title={
                  <FormattedMessage id="app.editAssignmentForm.title" defaultMessage="Edit Assignment Properties" />
                }
                unlimitedHeight>
                <ResourceRenderer resourceArray={runtimeEnvironments}>
                  {envs => (
                    <EditAssignmentForm
                      form="editAssignment"
                      userId={userId}
                      initialValues={
                        assignment ? prepareEditFormInitialValues(assignment, hasNotificationAsyncJob) : {}
                      }
                      onSubmit={this.editAssignmentSubmitHandler}
                      deadlines={deadlines}
                      runtimeEnvironments={envs}
                      visibility={visibility}
                      showSendNotification={showSendNotification(assignment, visibility, visibleFrom)}
                      mergeJudgeLogs={assignment.mergeJudgeLogs}
                      canViewLimitRatios={canViewLimitRatios}
                      localizedTextsLinks={assignment.localizedTextsLinks}
                    />
                  )}
                </ResourceRenderer>
              </Box>

              <Box
                title={
                  <FormattedMessage
                    id="app.editAssignmentLocalizedTextsForm.title"
                    defaultMessage="Override Localized Texts for the Assignment"
                  />
                }
                unlimitedHeight
                collapsable
                isOpen={false}>
                <ResourceRenderer resourceArray={runtimeEnvironments}>
                  {envs => (
                    <EditAssignmentLocalizedTextsForm
                      form="editAssignmentLocalizedTexts"
                      initialValues={assignment ? prepareEditLocalizedTextsInitialValues(assignment) : {}}
                      onSubmit={this.editLocalizedTextsSubmitHandler}
                    />
                  )}
                </ResourceRenderer>
              </Box>
              <br />
              {assignment.permissionHints.remove && (
                <Box
                  type="danger"
                  title={
                    <FormattedMessage id="app.editAssignment.deleteAssignment" defaultMessage="Delete the assignment" />
                  }>
                  <Row className="align-items-center">
                    <Col xs={false} sm="auto">
                      <DeleteAssignmentButtonContainer
                        id={assignmentId}
                        size="lg"
                        className="m-2"
                        onDeleted={() => navigate(GROUP_ASSIGNMENTS_URI_FACTORY(assignment.groupId), { replace: true })}
                      />
                    </Col>
                    <Col xs={12} sm className="text-body-secondary">
                      <FormattedMessage
                        id="app.editAssignment.deleteAssignmentWarning"
                        defaultMessage="Deleting an assignment will remove all the students submissions and you will have to contact the administrator of ReCodEx if you wanted to restore the assignment in the future."
                      />
                    </Col>
                  </Row>
                </Box>
              )}
            </>
          )
        }
      </Page>
    );
  }
}

EditAssignment.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired,
  }).isRequired,
  assignment: ImmutablePropTypes.map,
  userId: PropTypes.string.isRequired,
  runtimeEnvironments: ImmutablePropTypes.map,
  asyncJobsLoading: PropTypes.bool,
  hasNotificationAsyncJob: PropTypes.bool,
  editAssignment: PropTypes.func.isRequired,
  editAssignmentLocalizedTexts: PropTypes.func.isRequired,
  deadlines: PropTypes.string,
  visibility: PropTypes.string,
  visibleFrom: PropTypes.object,
  canViewLimitRatios: PropTypes.bool,
  exerciseSync: PropTypes.func.isRequired,
  validateAssignment: PropTypes.func.isRequired,
  links: PropTypes.object,
  navigate: withRouterProps.navigate,
};

const editAssignmentFormSelector = formValueSelector('editAssignment');

export default withLinks(
  connect(
    (state, { params: { assignmentId } }) => {
      const assignment = getAssignment(state, assignmentId);
      return {
        assignment,
        userId: loggedInUserIdSelector(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        asyncJobsLoading: getFetchAssignmentAsyncJobsPending(state, assignmentId),
        hasNotificationAsyncJob: hasPendingNotificationAsyncJob(state, assignmentId),
        deadlines: editAssignmentFormSelector(state, 'deadlines'),
        visibility: editAssignmentFormSelector(state, 'visibility'),
        visibleFrom: editAssignmentFormSelector(state, 'visibleFrom'),
        canViewLimitRatios: editAssignmentFormSelector(state, 'canViewLimitRatios'),
      };
    },
    (dispatch, { params: { assignmentId } }) => ({
      reset: () => dispatch(reset('editAssignment')),
      loadAsync: () => EditAssignment.loadAsync({ assignmentId }, dispatch),
      editAssignment: data =>
        dispatch(editAssignment(assignmentId, data)).then(() => dispatch(fetchAssignmentAsyncJobs(assignmentId))),
      editAssignmentLocalizedTexts: data =>
        dispatch(editAssignmentLocalizedTexts(assignmentId, data)).then(() =>
          dispatch(fetchAssignmentAsyncJobs(assignmentId))
        ),
      exerciseSync: () => dispatch(syncWithExercise(assignmentId)),
      validateAssignment: version => dispatch(validateAssignment(assignmentId, version)),
    })
  )(EditAssignment)
);
