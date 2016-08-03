import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Grid, Col, Row } from 'react-bootstrap';
import { push } from 'react-router-redux';

import { SUBMIT_SOLUTION_URI_FACTORY } from '../../links';
import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';

import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { init, submissionStatus } from '../../redux/modules/submission';

import PageContent from '../../components/PageContent';
import AssignmentDetails, {
  LoadingAssignmentDetails,
  FailedAssignmentDetails
} from '../../components/Assignment/AssignmentDetails';
import SubmitSolutionButton from '../../components/SubmitSolutionButton';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import EvaluationProgressContainer from '../../containers/EvaluationProgressContainer';

class Assignment extends Component {

  componentWillMount() {
    Assignment.loadData(this.props);
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

  state = { showSubmissionModal: false };
  openSubmission = () => {
    this.init();
    this.setState({ showSubmissionModal: true });
  };
  hideSubmission = () => this.setState({ showSubmissionModal: false });

  init = () => {
    const { init, userId } = this.props;
    init(userId);
  };

  render() {
    const {
      assignment,
      children
    } = this.props;

    const title = isLoading(assignment) ? 'Načítám ...' : assignment.data.name;

    return (
      <PageContent title={title} description={'Zadání úlohy'}>
          <Row>
            <Col md={6}>
              {isLoading(assignment) && <LoadingAssignmentDetails />}
              {hasFailed(assignment) && <FailedAssignmentDetails />}
              {isReady(assignment) && (
                <div>
                  <AssignmentDetails assignment={assignment.data} />
                  <p className='text-center'>
                    <SubmitSolutionButton onClick={this.openSubmission} />
                  </p>
                  <SubmitSolutionContainer
                    reset={this.init}
                    assignmentId={assignment.data.id}
                    isOpen={this.state.showSubmissionModal}
                    onClose={this.hideSubmission} />
                </div>
              )}
            </Col>
            <Col md={6}>
              {children}
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
  init: PropTypes.func.isRequired,
  loadAssignmentIfNeeded: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({
    assignment: state.assignments.getIn([ 'resources', props.params.assignmentId ]),
    userId: state.auth.userId
  }),
  (dispatch, props) => ({
    init: (userId, assignmentId) => dispatch(init(userId, assignmentId)),
    loadAssignmentIfNeeded: (assignmentId) => dispatch(fetchAssignmentIfNeeded(assignmentId))
  })
)(Assignment);
