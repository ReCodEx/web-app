import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'react-bootstrap';

import Button from '../../components/widgets/FlatButton';
import { LinkContainer } from 'react-router-bootstrap';

import {
  fetchAssignmentIfNeeded,
  syncWithExercise
} from '../../redux/modules/assignments';
import { canSubmit } from '../../redux/modules/canSubmit';
import {
  init,
  submitAssignmentSolution as submitSolution
} from '../../redux/modules/submission';
import { fetchUsersSubmissions } from '../../redux/modules/submissions';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import {
  getAssignment,
  assignmentEnvironmentsSelector,
  getUserSubmissions
} from '../../redux/selectors/assignments';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  isStudentOf,
  isSupervisorOf,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import UsersNameContainer from '../../containers/UsersNameContainer';
import { ResubmitAllSolutionsContainer } from '../../containers/ResubmitSolutionContainer';
import HierarchyLineContainer from '../../containers/HierarchyLineContainer';
import AssignmentDetails from '../../components/Assignments/Assignment/AssignmentDetails';
import { EditIcon, ResultsIcon } from '../../components/icons';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import SubmitSolutionButton from '../../components/Assignments/SubmitSolutionButton';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import SubmissionsTable from '../../components/Assignments/SubmissionsTable';
import AssignmentSync from '../../components/Assignments/Assignment/AssignmentSync';

import withLinks from '../../hoc/withLinks';

class Assignment extends Component {
  static loadAsync = ({ assignmentId }, dispatch, userId) =>
    Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(canSubmit(assignmentId)),
      dispatch(fetchUsersSubmissions(userId, assignmentId))
    ]);

  componentWillMount() {
    this.props.loadAsync(this.props.userId);
  }

  componentWillReceiveProps(newProps) {
    if (
      this.props.params.assignmentId !== newProps.params.assignmentId ||
      this.props.userId !== newProps.userId
    ) {
      newProps.loadAsync(newProps.userId);
    }
  }

  isAfter = unixTime => {
    return unixTime * 1000 < Date.now();
  };

  sortSubmissions(submissions) {
    return submissions.sort((a, b) => {
      var aTimestamp = a.getIn(['data', 'solution', 'createdAt']);
      var bTimestamp = b.getIn(['data', 'solution', 'createdAt']);
      return bTimestamp - aTimestamp;
    });
  }

  render() {
    const {
      assignment,
      submitting,
      userId,
      loggedInUserId,
      init,
      isSuperAdmin,
      isStudentOf,
      isSupervisorOf,
      canSubmit,
      runtimeEnvironments,
      exerciseSync,
      submissions,
      links: { ASSIGNMENT_EDIT_URI_FACTORY, SUPERVISOR_STATS_URI_FACTORY }
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={assignment => <LocalizedExerciseName entity={assignment} />}
        description={
          <FormattedMessage
            id="app.assignment.title"
            defaultMessage="Exercise assignment"
          />
        }
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'group',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.group.title"
                  defaultMessage="Group detail"
                />
              ),
              link: ({ GROUP_URI_FACTORY }) =>
                GROUP_URI_FACTORY(assignment.groupId)
            })
          },
          {
            text: (
              <FormattedMessage
                id="app.assignment.title"
                defaultMessage="Exercise assignment"
              />
            ),
            iconName: 'puzzle-piece'
          }
        ]}
      >
        {assignment =>
          <div>
            <Row>
              <Col xs={12}>
                <HierarchyLineContainer groupId={assignment.groupId} />
                {loggedInUserId !== userId &&
                  <p>
                    <UsersNameContainer userId={userId} />
                  </p>}
                {(isSuperAdmin || isSupervisorOf(assignment.groupId)) &&
                  <p>
                    <LinkContainer
                      to={ASSIGNMENT_EDIT_URI_FACTORY(assignment.id)}
                    >
                      <Button bsStyle="warning">
                        <EditIcon />{' '}
                        <FormattedMessage
                          id="app.assignment.editSettings"
                          defaultMessage="Edit Assignment Settings"
                        />
                      </Button>
                    </LinkContainer>
                    <LinkContainer
                      to={SUPERVISOR_STATS_URI_FACTORY(assignment.id)}
                    >
                      <Button bsStyle="primary">
                        <ResultsIcon />{' '}
                        <FormattedMessage
                          id="app.assignment.viewResults"
                          defaultMessage="Student Results"
                        />
                      </Button>
                    </LinkContainer>
                    <ResubmitAllSolutionsContainer
                      assignmentId={assignment.id}
                    />
                  </p>}
              </Col>
            </Row>
            {(isSuperAdmin || isSupervisorOf(assignment.groupId)) &&
              <AssignmentSync
                syncInfo={assignment.exerciseSynchronizationInfo}
                exerciseSync={exerciseSync}
              />}

            <Row>
              <Col lg={6}>
                {assignment.localizedTexts.length > 0 &&
                  <div>
                    <LocalizedTexts locales={assignment.localizedTexts} />
                  </div>}
              </Col>
              <ResourceRenderer resource={runtimeEnvironments}>
                {(...runtimes) =>
                  <Col lg={6}>
                    <AssignmentDetails
                      {...assignment}
                      isAfterFirstDeadline={this.isAfter(
                        assignment.firstDeadline
                      )}
                      isAfterSecondDeadline={this.isAfter(
                        assignment.secondDeadline
                      )}
                      canSubmit={canSubmit}
                      runtimeEnvironments={runtimes}
                      alreadySubmitted={submissions.count()}
                    />

                    {isStudentOf(assignment.groupId) &&
                      <div>
                        <p className="text-center">
                          <ResourceRenderer
                            loading={<SubmitSolutionButton disabled={true} />}
                            resource={canSubmit}
                          >
                            {canSubmit =>
                              <SubmitSolutionButton
                                onClick={init(assignment.id)}
                                disabled={!canSubmit}
                              />}
                          </ResourceRenderer>
                        </p>
                        <SubmitSolutionContainer
                          userId={userId}
                          id={assignment.id}
                          onSubmit={submitSolution}
                          onReset={init}
                          isOpen={submitting}
                          runtimeEnvironments={runtimes}
                        />
                      </div>}

                    {(isStudentOf(assignment.groupId) ||
                      isSupervisorOf(assignment.groupId) ||
                      isSuperAdmin) &&
                      <SubmissionsTable
                        title={
                          <FormattedMessage
                            id="app.submissionsTable.title"
                            defaultMessage="Submitted solutions"
                          />
                        }
                        userId={userId}
                        submissions={this.sortSubmissions(submissions)}
                        assignmentId={assignment.id}
                        runtimeEnvironments={runtimes}
                        noteMaxlen={32}
                      />}
                  </Col>}
              </ResourceRenderer>
            </Row>
          </div>}
      </Page>
    );
  }
}

Assignment.propTypes = {
  userId: PropTypes.string.isRequired,
  loggedInUserId: PropTypes.string,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }),
  isSuperAdmin: PropTypes.bool,
  isStudentOf: PropTypes.func.isRequired,
  isSupervisorOf: PropTypes.func.isRequired,
  assignment: PropTypes.object,
  canSubmit: ImmutablePropTypes.map,
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  runtimeEnvironments: PropTypes.array,
  exerciseSync: PropTypes.func.isRequired,
  submissions: ImmutablePropTypes.list.isRequired
};

export default withLinks(
  connect(
    (state, { params: { assignmentId, userId } }) => {
      const loggedInUserId = loggedInUserIdSelector(state);
      userId = userId || loggedInUserId;
      return {
        assignment: getAssignment(state)(assignmentId),
        submitting: isSubmitting(state),
        runtimeEnvironments: assignmentEnvironmentsSelector(state)(
          assignmentId
        ),
        userId,
        loggedInUserId,
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        isStudentOf: groupId => isStudentOf(loggedInUserId, groupId)(state),
        isSupervisorOf: groupId =>
          isSupervisorOf(loggedInUserId, groupId)(state),
        canSubmit: canSubmitSolution(assignmentId)(state),
        submissions: getUserSubmissions(userId, assignmentId)(state)
      };
    },
    (dispatch, { params: { assignmentId, userId } }) => ({
      init: userId => () => dispatch(init(userId, assignmentId)),
      loadAsync: userId =>
        Assignment.loadAsync({ assignmentId }, dispatch, userId),
      exerciseSync: () => dispatch(syncWithExercise(assignmentId))
    })
  )(Assignment)
);
