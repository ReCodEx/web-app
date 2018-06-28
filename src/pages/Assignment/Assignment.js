import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
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
  submitAssignmentSolution as submitSolution,
  presubmitAssignmentSolution as presubmitSolution
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
  isAdminOf
} from '../../redux/selectors/users';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
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

import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';

class Assignment extends Component {
  static loadAsync = ({ assignmentId }, dispatch, { userId }) =>
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
      isStudentOf,
      isSupervisorOf,
      isAdminOf,
      canSubmit,
      runtimeEnvironments,
      exerciseSync,
      submissions,
      links: { ASSIGNMENT_EDIT_URI_FACTORY, ASSIGNMENT_STATS_URI_FACTORY },
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={assignment => getLocalizedName(assignment, locale)}
        description={
          <FormattedMessage
            id="app.assignment.title"
            defaultMessage="Exercise assignment"
          />
        }
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'users',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.group.title"
                  defaultMessage="Group detail"
                />
              ),
              link: ({ GROUP_DETAIL_URI_FACTORY }) =>
                GROUP_DETAIL_URI_FACTORY(assignment.groupId)
            })
          },
          {
            resource: assignment,
            iconName: 'puzzle-piece',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.exercise.title"
                  defaultMessage="Exercise"
                />
              ),
              link: ({ EXERCISE_URI_FACTORY }) =>
                isAdminOf(assignment.groupId) ||
                isSupervisorOf(assignment.groupId)
                  ? EXERCISE_URI_FACTORY(assignment.exerciseId)
                  : '#'
            })
          },
          {
            text: (
              <FormattedMessage
                id="app.assignment.title"
                defaultMessage="Exercise assignment"
              />
            ),
            iconName: 'hourglass-start'
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
                {(isSupervisorOf(assignment.groupId) ||
                  isAdminOf(assignment.groupId)) && // includes superadmin
                  <p>
                    <LinkContainer
                      to={ASSIGNMENT_EDIT_URI_FACTORY(assignment.id)}
                    >
                      <Button bsStyle="warning">
                        <EditIcon gapRight />
                        <FormattedMessage
                          id="app.assignment.editSettings"
                          defaultMessage="Edit Assignment Settings"
                        />
                      </Button>
                    </LinkContainer>
                    <LinkContainer
                      to={ASSIGNMENT_STATS_URI_FACTORY(assignment.id)}
                    >
                      <Button bsStyle="primary">
                        <ResultsIcon gapRight />
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
            {(isSupervisorOf(assignment.groupId) ||
              isAdminOf(assignment.groupId)) && // includes superadmin
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
              <ResourceRenderer resource={[canSubmit, ...runtimeEnvironments]}>
                {(canSubmitObj, ...runtimes) =>
                  <Col lg={6}>
                    <AssignmentDetails
                      {...assignment}
                      isAfterFirstDeadline={this.isAfter(
                        assignment.firstDeadline
                      )}
                      isAfterSecondDeadline={this.isAfter(
                        assignment.secondDeadline
                      )}
                      canSubmit={canSubmitObj}
                      runtimeEnvironments={runtimes}
                    />

                    {isStudentOf(assignment.groupId) &&
                      <div>
                        <p className="text-center">
                          <ResourceRenderer
                            loading={<SubmitSolutionButton disabled={true} />}
                            resource={canSubmit}
                          >
                            {canSubmitObj =>
                              <SubmitSolutionButton
                                onClick={init(assignment.id)}
                                disabled={!canSubmitObj.canSubmit}
                              />}
                          </ResourceRenderer>
                        </p>
                        <SubmitSolutionContainer
                          userId={userId}
                          id={assignment.id}
                          onSubmit={submitSolution}
                          presubmitValidation={presubmitSolution}
                          onReset={init}
                          isOpen={submitting}
                        />
                      </div>}

                    {(isStudentOf(assignment.groupId) ||
                      isSupervisorOf(assignment.groupId) ||
                      isAdminOf(assignment.groupId)) && // includes superadmin
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
  submissions: ImmutablePropTypes.list.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(
  withLinks(
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
          isStudentOf: groupId => isStudentOf(loggedInUserId, groupId)(state),
          isSupervisorOf: groupId =>
            isSupervisorOf(loggedInUserId, groupId)(state),
          isAdminOf: groupId => isAdminOf(loggedInUserId, groupId)(state),
          canSubmit: canSubmitSolution(assignmentId)(state),
          submissions: getUserSubmissions(userId, assignmentId)(state)
        };
      },
      (dispatch, { params: { assignmentId, userId } }) => ({
        init: userId => () => dispatch(init(userId, assignmentId)),
        loadAsync: userId =>
          Assignment.loadAsync({ assignmentId }, dispatch, { userId }),
        exerciseSync: () => dispatch(syncWithExercise(assignmentId))
      })
    )(Assignment)
  )
);
