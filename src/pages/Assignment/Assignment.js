import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Grid, Col, Row } from 'react-bootstrap';
import { push } from 'react-router-redux';

import { SUBMIT_SOLUTION_URI_FACTORY } from '../../links';
import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';

import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { init, cancel, submissionStatus } from '../../redux/modules/submission';

import PageContent from '../../components/PageContent';
import AssignmentDetails, {
  LoadingAssignmentDetails,
  FailedAssignmentDetails
} from '../../components/Assignment/AssignmentDetails';
import SubmitSolutionButton from '../../components/SubmitSolutionButton';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import EvaluationProgressContainer from '../../containers/EvaluationProgressContainer';
import SubmissionsTableContainer from '../../containers/SubmissionsTableContainer';

class Assignment extends Component {

  componentWillMount() {
    this.updateTime();
    this.deadlineUpdater = setInterval(this.updateTime, 5 * 1000); // once per five seconds
    Assignment.loadData(this.props);
  }

  updateTime = () => this.setState({ time: Date.now() });

  componentWillUnount() {
    clearInterval(this.deadlineUpdater);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.assignmentId !== newProps.params.assignmentId) {
      Assignment.loadData(newProps);
    }
  }

  static loadData = ({
    params: { assignmentId },
    loadAssignmentIfNeeded
  }) => {
    loadAssignmentIfNeeded(assignmentId);
  };

  initSubmission = () => {
    const { init, userId } = this.props;
    init(userId);
  };

  hideSubmission = () => {
    const { cancel } = this.props;
    cancel();
  };

  render() {
    const {
      assignment,
      submitting,
      params: { assignmentId }
    } = this.props;

    const title = isLoading(assignment)
                    ? 'Načítám ...'
                    : assignment.data.name;

    return (
      <PageContent title={title} description={'Zadání úlohy'}>
        <Row>
          <Col md={6}>
            {isLoading(assignment) && <LoadingAssignmentDetails />}
            {hasFailed(assignment) && <FailedAssignmentDetails />}
            {isReady(assignment) && (
              <div>
                <AssignmentDetails
                  assignment={assignment.data}
                  isAfterFirstDeadline={assignment.data.deadline.first * 1000 < this.state.time}
                  isAfterSecondDeadline={assignment.data.deadline.second * 1000 < this.state.time} />
                <p className='text-center'>
                  <SubmitSolutionButton onClick={this.initSubmission} />
                </p>
                <SubmitSolutionContainer
                  reset={this.initSubmission}
                  assignmentId={assignment.data.id}
                  isOpen={submitting}
                  onClose={this.hideSubmission} />
              </div>
            )}
          </Col>
          <Col md={6}>
            <SubmissionsTableContainer assignmentId={assignmentId} />
          </Col>
        </Row>
      </PageContent>
    );
  }

}

Assignment.props = {
  userId: PropTypes.string.isRequired,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }),
  assignment: PropTypes.object,
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  loadAssignmentIfNeeded: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({
    assignment: state.assignments.getIn([ 'resources', props.params.assignmentId ]),
    submitting: state.submission.get('status') === submissionStatus.CREATING || state.submission.get('status') === submissionStatus.SENDING,
    userId: state.auth.userId
  }),
  (dispatch, props) => ({
    init: (userId, assignmentId) => dispatch(init(userId, assignmentId)),
    cancel: (userId, assignmentId) => dispatch(cancel()),
    loadAssignmentIfNeeded: (assignmentId) => dispatch(fetchAssignmentIfNeeded(assignmentId))
  })
)(Assignment);
