import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Col, Row } from 'react-bootstrap';

import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import OptionalPopoverWrapper from '../../components/widgets/OptionalPopoverWrapper';

import { fetchAssignmentIfNeeded, syncWithExercise } from '../../redux/modules/assignments';
import { canSubmit } from '../../redux/modules/canSubmit';
import {
  init,
  submitAssignmentSolution as submitSolution,
  presubmitAssignmentSolution as presubmitSolution,
} from '../../redux/modules/submission';
import {
  fetchUsersSolutions,
  fetchAssignmentSolvers,
  fetchAssignmentSolversIfNeeded,
} from '../../redux/modules/solutions';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import {
  getAssignment,
  assignmentEnvironmentsSelector,
  getUserSolutionsSortedData,
} from '../../redux/selectors/assignments';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  fetchManyUserSolutionsStatus,
  isAssignmentSolversLoading,
  getAssignmentSolverSelector,
} from '../../redux/selectors/solutions';
import { loggedUserIsStudentOfSelector } from '../../redux/selectors/usersGroups';

import Page from '../../components/layout/Page';
import { AssignmentNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import AssignmentDetails from '../../components/Assignments/Assignment/AssignmentDetails';
import Icon, { AssignmentIcon } from '../../components/icons';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import SubmitSolutionButton from '../../components/Assignments/SubmitSolutionButton';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import AssignmentSync from '../../components/Assignments/Assignment/AssignmentSync';
import CommentThreadContainer from '../../containers/CommentThreadContainer';

import LoadingSolutionsTable from '../../components/Assignments/SolutionsTable/LoadingSolutionsTable';
import FailedLoadingSolutionsTable from '../../components/Assignments/SolutionsTable/FailedLoadingSolutionsTable';
import { hasPermissions } from '../../helpers/common';

const getReason = ({ lockedReason }, locale) =>
  typeof lockedReason === 'object'
    ? lockedReason[locale] || lockedReason.en || Object.values(lockedReason)[0] || 'Reason unknown.'
    : lockedReason;

class Assignment extends Component {
  static loadAsync = ({ assignmentId }, dispatch, { userId }) =>
    Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(canSubmit(assignmentId)),
      dispatch(fetchUsersSolutions(userId, assignmentId)),
      dispatch(fetchAssignmentSolversIfNeeded({ assignmentId, userId })),
    ]);

  componentDidMount() {
    this.props.loadAsync(this.props.userId || this.props.loggedInUserId);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.params.assignmentId !== prevProps.params.assignmentId ||
      this.props.userId !== prevProps.userId ||
      (!prevProps.userId && this.props.loggedInUserId !== prevProps.loggedInUserId)
    ) {
      this.props.loadAsync(this.props.userId || this.props.loggedInUserId);
    }
  }

  reloadAfterSubmit = () =>
    Promise.all([
      this.props.reloadSolvers(this.props.params.assignmentId, this.props.userId || this.props.loggedInUserId),
      this.props.reloadCanSubmit(),
    ]);

  render() {
    const {
      assignment,
      submitting,
      userId,
      loggedInUserId,
      init,
      isStudentOf,
      canSubmit,
      runtimeEnvironments,
      exerciseSync,
      solutions,
      fetchManyStatus,
      assignmentSolversLoading,
      assignmentSolverSelector,
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={assignment}
        icon={<AssignmentIcon />}
        title={<FormattedMessage id="app.assignment.title" defaultMessage="Assignment Detail" />}>
        {assignment => (
          <div>
            <AssignmentNavigation
              assignmentId={assignment.id}
              userId={userId}
              groupId={assignment.groupId}
              exerciseId={assignment.exerciseId}
              canEdit={hasPermissions(assignment, 'update')}
              canViewSolutions={hasPermissions(assignment, 'viewAssignmentSolutions')}
              canViewExercise={
                hasPermissions(
                  assignment,
                  'viewAssignmentSolutions'
                ) /* this is not the exact hint, but we do not have anything better now */
              }
            />

            {assignment.exerciseId && hasPermissions(assignment, 'update') && (
              <AssignmentSync syncInfo={assignment.exerciseSynchronizationInfo} exerciseSync={exerciseSync} />
            )}

            {!assignment.exerciseId && hasPermissions(assignment, 'update') && (
              <Callout variant="warning">
                <h3 className="no-margin ">
                  <Icon icon="ghost" gapRight />
                  <FormattedMessage
                    id="app.assignment.exerciseDeleted"
                    defaultMessage="Corresponding exercise has been deleted."
                  />
                </h3>
                <p className="halfem-margin-top">
                  <FormattedMessage
                    id="app.assignment.exerciseDeletedInfo"
                    defaultMessage="The assignment may no longer be synchronized with the exercise and no more assignments of this exercise may be created."
                  />
                </p>
              </Callout>
            )}

            <ResourceRenderer resource={[canSubmit, ...runtimeEnvironments]}>
              {(canSubmitObj, ...runtimes) => (
                <Row>
                  <Col xl={6}>
                    <AssignmentDetails
                      {...assignment}
                      canSubmit={canSubmitObj}
                      runtimeEnvironments={runtimes}
                      assignmentSolver={assignmentSolverSelector(assignment.id, userId || loggedInUserId)}
                      isStudent={isStudentOf(assignment.groupId)}
                      className="d-flex d-xl-none"
                    />

                    {assignment.localizedTexts.length > 0 && (
                      <div>
                        <LocalizedTexts locales={assignment.localizedTexts} />
                      </div>
                    )}
                  </Col>
                  <Col xl={6}>
                    <AssignmentDetails
                      {...assignment}
                      canSubmit={canSubmitObj}
                      runtimeEnvironments={runtimes}
                      assignmentSolver={assignmentSolverSelector(assignment.id, userId || loggedInUserId)}
                      isStudent={isStudentOf(assignment.groupId)}
                      className="d-none d-xl-flex"
                    />

                    {isStudentOf(assignment.groupId) && (
                      <div>
                        <p className="text-center">
                          <ResourceRenderer loading={<SubmitSolutionButton disabled={true} />} resource={canSubmit}>
                            {canSubmitObj => (
                              <OptionalPopoverWrapper
                                container={this}
                                popoverId={`submit-locked-${assignment.id}`}
                                placement="bottom"
                                hide={!canSubmitObj.lockedReason}
                                title={
                                  <FormattedMessage
                                    id="app.assignments.lockedSubmissions.title"
                                    defaultMessage="Submissions are currently locked out"
                                  />
                                }
                                contents={
                                  <>
                                    <strong>
                                      <FormattedMessage
                                        id="app.assignments.lockedSubmissions.reason"
                                        defaultMessage="Reason"
                                      />
                                      :
                                    </strong>{' '}
                                    {getReason(canSubmitObj, locale)}
                                  </>
                                }>
                                <SubmitSolutionButton
                                  onClick={init(assignment.id)}
                                  disabled={!canSubmitObj.canSubmit}
                                />
                              </OptionalPopoverWrapper>
                            )}
                          </ResourceRenderer>
                        </p>
                        {canSubmitObj.canSubmit && (
                          <SubmitSolutionContainer
                            userId={loggedInUserId}
                            id={assignment.id}
                            onSubmit={submitSolution}
                            presubmitValidation={presubmitSolution}
                            afterEvaluationStarts={this.reloadAfterSubmit}
                            onReset={init}
                            isOpen={submitting}
                            solutionFilesLimit={assignment.solutionFilesLimit}
                            solutionSizeLimit={assignment.solutionSizeLimit}
                          />
                        )}
                      </div>
                    )}

                    {(isStudentOf(assignment.groupId) ||
                      (userId && hasPermissions(assignment, 'viewAssignmentSolutions'))) && ( // includes superadmin
                      <Box
                        title={<FormattedMessage id="app.solutionsTable.title" defaultMessage="Submitted Solutions" />}
                        collapsable
                        isOpen
                        noPadding
                        unlimitedHeight>
                        <FetchManyResourceRenderer
                          fetchManyStatus={fetchManyStatus}
                          loading={<LoadingSolutionsTable />}
                          failed={<FailedLoadingSolutionsTable />}>
                          {() => (
                            <SolutionsTable
                              solutions={solutions}
                              assignmentId={assignment.id}
                              groupId={assignment.groupId}
                              runtimeEnvironments={runtimes}
                              noteMaxlen={64}
                              compact
                              assignmentSolversLoading={assignmentSolversLoading}
                              assignmentSolver={assignmentSolverSelector(assignment.id, userId || loggedInUserId)}
                            />
                          )}
                        </FetchManyResourceRenderer>
                      </Box>
                    )}

                    <CommentThreadContainer
                      threadId={assignment.id}
                      title={
                        <FormattedMessage
                          id="app.assignments.discussionModalTitle"
                          defaultMessage="Public Discussion"
                        />
                      }
                      additionalPublicSwitchNote={
                        <FormattedMessage
                          id="app.assignments.discussionModal.additionalSwitchNote"
                          defaultMessage="(supervisors and students of this group)"
                        />
                      }
                    />
                  </Col>
                </Row>
              )}
            </ResourceRenderer>
          </div>
        )}
      </Page>
    );
  }
}

Assignment.propTypes = {
  userId: PropTypes.string,
  loggedInUserId: PropTypes.string,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired,
    userId: PropTypes.string,
  }).isRequired,
  isStudentOf: PropTypes.func.isRequired,
  assignment: PropTypes.object,
  canSubmit: ImmutablePropTypes.map,
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.array,
  exerciseSync: PropTypes.func.isRequired,
  solutions: ImmutablePropTypes.list.isRequired,
  fetchManyStatus: PropTypes.string,
  assignmentSolversLoading: PropTypes.bool,
  assignmentSolverSelector: PropTypes.func.isRequired,
  reloadCanSubmit: PropTypes.func.isRequired,
  reloadSolvers: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(
  connect(
    (state, { params: { assignmentId, userId = null } }) => {
      const loggedInUserId = loggedInUserIdSelector(state);
      return {
        assignment: getAssignment(state, assignmentId),
        submitting: isSubmitting(state),
        runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId),
        userId,
        loggedInUserId,
        isStudentOf: loggedUserIsStudentOfSelector(state),
        canSubmit: canSubmitSolution(assignmentId)(state),
        solutions: getUserSolutionsSortedData(state)(userId || loggedInUserId, assignmentId),
        fetchManyStatus: fetchManyUserSolutionsStatus(state)(userId || loggedInUserId, assignmentId),
        assignmentSolversLoading: isAssignmentSolversLoading(state),
        assignmentSolverSelector: getAssignmentSolverSelector(state),
      };
    },
    (dispatch, { params: { assignmentId } }) => ({
      init: userId => () => dispatch(init(userId, assignmentId)),
      loadAsync: userId => Assignment.loadAsync({ assignmentId }, dispatch, { userId }),
      exerciseSync: () => dispatch(syncWithExercise(assignmentId)),
      reloadCanSubmit: () => dispatch(canSubmit(assignmentId)),
      reloadSolvers: (assignmentId, userId) => dispatch(fetchAssignmentSolvers({ assignmentId, userId })),
    })
  )(Assignment)
);
