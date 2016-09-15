import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Grid, Col, Row } from 'react-bootstrap';
import { push } from 'react-router-redux';

import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';

import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { init, cancel, submissionStatus } from '../../redux/modules/submission';
import { createAssignmentSelector } from '../../redux/selectors/assignments';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isStudentOf } from '../../redux/selectors/users';

import PageContent from '../../components/PageContent';
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
    Assignment.loadData(this.props);
  }

  componentWillUnmount() {
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
      params: { assignmentId },
      isStudentOf
    } = this.props;

    const {
      links: { GROUP_URI_FACTORY, SUBMIT_SOLUTION_URI_FACTORY }
    } = this.context;

    const title = isLoading(assignment)
                    ? <FormattedMessage id='app.loading' defaultMessage='Loading ...' />
                    : assignment.getIn(['data', 'name']);

    return (
      <PageContent
        title={title}
        description={<FormattedMessage id='app.assignment.title' defaultMessage='Exercise assignment' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.group.title' defaultMessage='Group detail' />,
            iconName: 'user',
            link: isReady(assignment) ? GROUP_URI_FACTORY(assignment.getIn(['data', 'groupId'])) : undefined
          },
          {
            text: <FormattedMessage id='app.assignment.title' defaultMessage='Exercise assignment' />,
            iconName: 'puzzle-piece'
          }
        ]}>
        <div>
          {isLoading(assignment) && <LoadingAssignmentDetails />}
          {hasFailed(assignment) && <FailedAssignmentDetails />}
          {isReady(assignment) && (
            <Row>
              <Col md={6}>
                <div>
                  <AssignmentDetails
                    assignment={assignment.get('data').toJS()}
                    isAfterFirstDeadline={assignment.getIn(['data', 'deadline', 'first']) * 1000 < this.state.time}
                    isAfterSecondDeadline={assignment.getIn(['data', 'deadline', 'second']) * 1000 < this.state.time} />

                  {isStudentOf(assignment.getIn(['data', 'groupId'])) && (
                    <div>
                      <p className='text-center'>
                        <SubmitSolutionButton onClick={this.initSubmission} disabled={!assignment.getIn(['data', 'canReceiveSubmissions'])} />
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
              {isStudentOf(assignment.getIn(['data', 'groupId'])) && (
                <SubmissionsTableContainer assignmentId={assignmentId} />
              )}
            </Col>
          </Row>
          )}
        </div>
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
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  loadAssignmentIfNeeded: PropTypes.func.isRequired
};

Assignment.contextTypes = {
  links: PropTypes.object
};

export default connect(
  (state, props) => {
    const assignmentSelector = createAssignmentSelector();
    const userId = loggedInUserIdSelector(state);
    return {
      assignment: assignmentSelector(state, props.params.assignmentId),
      submitting: isSubmitting(state),
      userId,
      isStudentOf: (groupId) => isStudentOf(userId, groupId)(state)
    };
  },
  (dispatch, props) => ({
    init: (userId, assignmentId) => dispatch(init(userId, assignmentId)),
    cancel: (userId, assignmentId) => dispatch(cancel()),
    loadAssignmentIfNeeded: (assignmentId) => dispatch(fetchAssignmentIfNeeded(assignmentId))
  })
)(Assignment);
