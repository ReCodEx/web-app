import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Grid, Col, Row } from 'react-bootstrap';
import { push } from 'react-router-redux';

import { isReady, isLoading, hasFailed, getJsData } from '../../redux/helpers/resourceManager';

import { fetchAssignmentIfNeeded, canSubmit } from '../../redux/modules/assignments';
import { init, cancel, submissionStatus } from '../../redux/modules/submission';
import { getAssignment, canSubmitSolution } from '../../redux/selectors/assignments';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isStudentOf } from '../../redux/selectors/users';

import PageContent from '../../components/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';
import AssignmentDetails, {
  LoadingAssignmentDetails,
  FailedAssignmentDetails
} from '../../components/Assignments/Assignment/AssignmentDetails';
import SubmitSolutionButton from '../../components/Assignments/SubmitSolutionButton';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import EvaluationProgressContainer from '../../containers/EvaluationProgressContainer';
import SubmissionsTableContainer from '../../containers/SubmissionsTableContainer';

class Assignment extends Component {

  updateTime = () => this.setState({ time: Date.now() });

  componentWillMount() {
    this.updateTime();
    this.deadlineUpdater = setInterval(this.updateTime, 5 * 1000); // once per five seconds
    this.props.loadAsync();
  }

  componentWillUnmount() {
    clearInterval(this.deadlineUpdater);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.assignmentId !== newProps.params.assignmentId) {
      newProps.loadAsync();
    }
  }

  initSubmission = () => {
    const { init, userId } = this.props;
    init(userId);
  };

  hideSubmission = () => {
    const { cancel } = this.props;
    cancel();
  };

  isAfter = (unixTime) => {
    return unixTime * 1000 < this.state.time;
  }

  render() {
    const {
      assignment,
      submitting,
      params: { assignmentId },
      isStudentOf,
      canSubmit = false
    } = this.props;

    const {
      links: { GROUP_URI_FACTORY, SUBMIT_SOLUTION_URI_FACTORY }
    } = this.context;

    const title = (
      <ResourceRenderer resource={assignment}>
        {assignment => <span>{assignment.name}</span>}
      </ResourceRenderer>
    );

    return (
      <PageContent
        title={title}
        description={<FormattedMessage id='app.assignment.title' defaultMessage='Exercise assignment' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.group.title' defaultMessage='Group detail' />,
            iconName: 'user',
            link: isReady(assignment) ? GROUP_URI_FACTORY(getJsData(assignment).groupId) : undefined
          },
          {
            text: <FormattedMessage id='app.assignment.title' defaultMessage='Exercise assignment' />,
            iconName: 'puzzle-piece'
          }
        ]}>
        <ResourceRenderer
          loading={<LoadingAssignmentDetails />}
          failed={<FailedAssignmentDetails />}
          resource={assignment}>
          {assignment => (
            <Row>
              <Col md={6}>
                <div>
                  <AssignmentDetails
                    assignment={assignment}
                    isAfterFirstDeadline={this.isAfter(assignment.deadline.first)}
                    isAfterSecondDeadline={this.isAfter(assignment.deadline.second)}
                    canSubmit={canSubmit} />

                  {isStudentOf(assignment.groupId) && (
                    <div>
                      <p className='text-center'>
                        <SubmitSolutionButton onClick={this.initSubmission} disabled={!canSubmit} />
                      </p>
                      <SubmitSolutionContainer
                        reset={this.initSubmission}
                        assignmentId={assignmentId}
                        isOpen={submitting}
                        onClose={this.hideSubmission} />
                    </div>
                  )}
                </div>
              </Col>
              <Col md={6}>
                {isStudentOf(assignment.groupId) && (
                  <SubmissionsTableContainer assignmentId={assignmentId} />
                )}
              </Col>
            </Row>
          )}
        </ResourceRenderer>
      </PageContent>
    );
  }

}

Assignment.propTypes = {
  userId: PropTypes.string.isRequired,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }),
  assignment: PropTypes.object,
  canSubmit: PropTypes.bool,
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired
};

Assignment.contextTypes = {
  links: PropTypes.object
};

export default connect(
  (state, { params: { assignmentId } }) => {
    const assignmentSelector = getAssignment(assignmentId);
    const userId = loggedInUserIdSelector(state);
    return {
      assignment: assignmentSelector(state),
      submitting: isSubmitting(state),
      userId,
      isStudentOf: (groupId) => isStudentOf(userId, groupId)(state),
      canSubmit: canSubmitSolution(assignmentId)(state)
    };
  },
  (dispatch, { params: { assignmentId } }) => ({
    init: (userId) => dispatch(init(userId, assignmentId)),
    cancel: (userId) => dispatch(cancel()),
    loadAsync: () => Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(canSubmit(assignmentId))
    ])
  })
)(Assignment);
