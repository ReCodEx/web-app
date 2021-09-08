import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Col, Row } from 'react-bootstrap';

import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';

import { fetchAssignmentIfNeeded, syncWithExercise } from '../../redux/modules/assignments';
import { canSubmit } from '../../redux/modules/canSubmit';
import {
  init,
  submitAssignmentSolution as submitSolution,
  presubmitAssignmentSolution as presubmitSolution,
} from '../../redux/modules/submission';
import { fetchUsersSolutions } from '../../redux/modules/solutions';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import {
  getAssignment,
  assignmentEnvironmentsSelector,
  getUserSolutionsSortedData,
} from '../../redux/selectors/assignments';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchManyUserSolutionsStatus } from '../../redux/selectors/solutions';
import {
  loggedUserIsStudentOfSelector,
  loggedUserIsObserverOfSelector,
  loggedUserIsSupervisorOfSelector,
  loggedUserIsAdminOfSelector,
} from '../../redux/selectors/usersGroups';

import Page from '../../components/layout/Page';
import { AssignmentNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import AssignmentDetails from '../../components/Assignments/Assignment/AssignmentDetails';
import Icon from '../../components/icons';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import SubmitSolutionButton from '../../components/Assignments/SubmitSolutionButton';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import AssignmentSync from '../../components/Assignments/Assignment/AssignmentSync';
import CommentThreadContainer from '../../containers/CommentThreadContainer';

import { getLocalizedName } from '../../helpers/localizedData';
import LoadingSolutionsTable from '../../components/Assignments/SolutionsTable/LoadingSolutionsTable';
import FailedLoadingSolutionsTable from '../../components/Assignments/SolutionsTable/FailedLoadingSolutionsTable';
import { hasPermissions } from '../../helpers/common';

class Assignment extends Component {
  static loadAsync = ({ assignmentId }, dispatch, { userId }) =>
    Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(canSubmit(assignmentId)),
      dispatch(fetchUsersSolutions(userId, assignmentId)),
    ]);

  componentDidMount() {
    this.props.loadAsync(this.props.userId || this.props.loggedInUserId);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.match.params.assignmentId !== prevProps.match.params.assignmentId ||
      this.props.userId !== prevProps.userId ||
      (!prevProps.userId && this.props.loggedInUserId !== prevProps.loggedInUserId)
    ) {
      this.props.loadAsync(this.props.userId || this.props.loggedInUserId);
    }
  }

  render() {
    const {
      assignment,
      submitting,
      userId,
      loggedInUserId,
      init,
      isStudentOf,
      isObserverOf,
      isSupervisorOf,
      isAdminOf,
      canSubmit,
      runtimeEnvironments,
      exerciseSync,
      solutions,
      fetchManyStatus,
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={assignment => getLocalizedName(assignment, locale)}
        description={<FormattedMessage id="app.assignment.title" defaultMessage="Exercise Assignment" />}>
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
                isObserverOf(assignment.groupId) || isSupervisorOf(assignment.groupId) || isAdminOf(assignment.groupId)
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
                      isStudent={isStudentOf(assignment.groupId)}
                      className="d-none d-xl-flex"
                    />

                    {isStudentOf(assignment.groupId) && (
                      <div>
                        <p className="text-center">
                          <ResourceRenderer loading={<SubmitSolutionButton disabled={true} />} resource={canSubmit}>
                            {canSubmitObj => (
                              <SubmitSolutionButton onClick={init(assignment.id)} disabled={!canSubmitObj.canSubmit} />
                            )}
                          </ResourceRenderer>
                        </p>
                        <SubmitSolutionContainer
                          userId={loggedInUserId}
                          id={assignment.id}
                          onSubmit={submitSolution}
                          presubmitValidation={presubmitSolution}
                          onReset={init}
                          isOpen={submitting}
                          solutionFilesLimit={assignment.solutionFilesLimit}
                          solutionSizeLimit={assignment.solutionSizeLimit}
                        />
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      assignmentId: PropTypes.string.isRequired,
      userId: PropTypes.string,
    }).isRequired,
  }).isRequired,
  isStudentOf: PropTypes.func.isRequired,
  isObserverOf: PropTypes.func.isRequired,
  isSupervisorOf: PropTypes.func.isRequired,
  isAdminOf: PropTypes.func.isRequired,
  assignment: PropTypes.object,
  canSubmit: ImmutablePropTypes.map,
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.array,
  exerciseSync: PropTypes.func.isRequired,
  solutions: ImmutablePropTypes.list.isRequired,
  fetchManyStatus: PropTypes.string,
  intl: PropTypes.object.isRequired,
};

export default connect(
  (
    state,
    {
      match: {
        params: { assignmentId, userId = null },
      },
    }
  ) => {
    const loggedInUserId = loggedInUserIdSelector(state);
    return {
      assignment: getAssignment(state)(assignmentId),
      submitting: isSubmitting(state),
      runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId),
      userId,
      loggedInUserId,
      isStudentOf: loggedUserIsStudentOfSelector(state),
      isObserverOf: loggedUserIsObserverOfSelector(state),
      isSupervisorOf: loggedUserIsSupervisorOfSelector(state),
      isAdminOf: loggedUserIsAdminOfSelector(state),
      canSubmit: canSubmitSolution(assignmentId)(state),
      solutions: getUserSolutionsSortedData(state)(userId || loggedInUserId, assignmentId),
      fetchManyStatus: fetchManyUserSolutionsStatus(state)(userId || loggedInUserId, assignmentId),
    };
  },
  (
    dispatch,
    {
      match: {
        params: { assignmentId },
      },
    }
  ) => ({
    init: userId => () => dispatch(init(userId, assignmentId)),
    loadAsync: userId => Assignment.loadAsync({ assignmentId }, dispatch, { userId }),
    exerciseSync: () => dispatch(syncWithExercise(assignmentId)),
  })
)(injectIntl(Assignment));
