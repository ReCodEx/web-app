import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Col, Row, Alert } from 'react-bootstrap';

import Button from '../../components/widgets/FlatButton';
import Box from '../../components/widgets/Box';
import { LinkContainer } from 'react-router-bootstrap';

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
import { isStudentOf, isSupervisorOf, isAdminOf } from '../../redux/selectors/users';
import { fetchManyUserSolutionsStatus } from '../../redux/selectors/solutions';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import UsersNameContainer from '../../containers/UsersNameContainer';
import HierarchyLineContainer from '../../containers/HierarchyLineContainer';
import AssignmentDetails from '../../components/Assignments/Assignment/AssignmentDetails';
import Icon, { EditIcon, ResultsIcon } from '../../components/icons';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import SubmitSolutionButton from '../../components/Assignments/SubmitSolutionButton';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import AssignmentSync from '../../components/Assignments/Assignment/AssignmentSync';
import CommentThreadContainer from '../../containers/CommentThreadContainer';

import withLinks from '../../helpers/withLinks';
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

  isAfter = unixTime => {
    return unixTime * 1000 < Date.now();
  };

  render() {
    const {
      assignment,
      submitting,
      userId,
      loggedInUserId,
      init,
      isStudentOf,
      isSupervisorOf,
      isAdminOf,
      canSubmit,
      runtimeEnvironments,
      exerciseSync,
      solutions,
      fetchManyStatus,
      links: { ASSIGNMENT_EDIT_URI_FACTORY, ASSIGNMENT_STATS_URI_FACTORY },
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={assignment => getLocalizedName(assignment, locale)}
        description={<FormattedMessage id="app.assignment.title" defaultMessage="Exercise Assignment" />}
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'tasks',
            breadcrumb: assignment => ({
              text: <FormattedMessage id="app.group.assignmentsLong" defaultMessage="Group Assignments" />,
              link: ({ GROUP_DETAIL_URI_FACTORY }) => GROUP_DETAIL_URI_FACTORY(assignment.groupId),
            }),
          },
          assignment && assignment.getIn(['data', 'exerciseId'])
            ? {
                resource: assignment,
                iconName: 'puzzle-piece',
                breadcrumb: assignment => ({
                  text: <FormattedMessage id="app.exercise.title" defaultMessage="Exercise" />,
                  link: ({ EXERCISE_URI_FACTORY }) =>
                    isAdminOf(assignment.groupId) || isSupervisorOf(assignment.groupId)
                      ? EXERCISE_URI_FACTORY(assignment.exerciseId)
                      : '#',
                }),
              }
            : {
                text: <FormattedMessage id="app.exercise.title" defaultMessage="Exercise" />,
                iconName: 'ghost',
              },
          {
            text: <FormattedMessage id="app.assignment.title" defaultMessage="Exercise Assignment" />,
            iconName: 'hourglass-start',
          },
        ]}>
        {assignment => (
          <div>
            <Row>
              <Col xs={12}>
                <HierarchyLineContainer groupId={assignment.groupId} />
                {userId && userId !== loggedInUserId && (
                  <p>
                    <UsersNameContainer userId={userId} />
                  </p>
                )}
                {(isSupervisorOf(assignment.groupId) || isAdminOf(assignment.groupId)) && ( // includes superadmin
                  <p>
                    <LinkContainer to={ASSIGNMENT_EDIT_URI_FACTORY(assignment.id)}>
                      <Button bsStyle="warning">
                        <EditIcon gapRight />
                        <FormattedMessage id="generic.edit" defaultMessage="Edit" />
                      </Button>
                    </LinkContainer>
                    <LinkContainer to={ASSIGNMENT_STATS_URI_FACTORY(assignment.id)}>
                      <Button bsStyle="primary">
                        <ResultsIcon gapRight />
                        <FormattedMessage id="app.assignment.viewResults" defaultMessage="Student Results" />
                      </Button>
                    </LinkContainer>
                  </p>
                )}
              </Col>
            </Row>

            {assignment.exerciseId && assignment.permissionHints.update && (
              <AssignmentSync syncInfo={assignment.exerciseSynchronizationInfo} exerciseSync={exerciseSync} />
            )}

            {!assignment.exerciseId && assignment.permissionHints.update && (
              <Alert bsStyle="warning">
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
              </Alert>
            )}

            <Row>
              <Col lg={6}>
                {assignment.localizedTexts.length > 0 && (
                  <div>
                    <LocalizedTexts locales={assignment.localizedTexts} />
                  </div>
                )}
              </Col>
              <ResourceRenderer resource={[canSubmit, ...runtimeEnvironments]}>
                {(canSubmitObj, ...runtimes) => (
                  <Col lg={6}>
                    <AssignmentDetails
                      {...assignment}
                      isAfterFirstDeadline={this.isAfter(assignment.firstDeadline)}
                      isAfterSecondDeadline={this.isAfter(assignment.secondDeadline)}
                      canSubmit={canSubmitObj}
                      runtimeEnvironments={runtimes}
                      isStudent={isStudentOf(assignment.groupId)}
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
                )}
              </ResourceRenderer>
            </Row>
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
  isSupervisorOf: PropTypes.func.isRequired,
  isAdminOf: PropTypes.func.isRequired,
  assignment: PropTypes.object,
  canSubmit: ImmutablePropTypes.map,
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  runtimeEnvironments: PropTypes.array,
  exerciseSync: PropTypes.func.isRequired,
  solutions: ImmutablePropTypes.list.isRequired,
  fetchManyStatus: PropTypes.string,
  intl: intlShape.isRequired,
};

export default withLinks(
  connect(
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
        isStudentOf: groupId => isStudentOf(loggedInUserId, groupId)(state),
        isSupervisorOf: groupId => isSupervisorOf(loggedInUserId, groupId)(state),
        isAdminOf: groupId => isAdminOf(loggedInUserId, groupId)(state),
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
  )(injectIntl(Assignment))
);
