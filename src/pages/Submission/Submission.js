import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal, Row, Col } from 'react-bootstrap';

import PageContent from '../../components/PageContent';
import SubmissionDetail, {
  LoadingSubmissionDetail,
  FailedSubmissionDetail
} from '../../components/Submissions/SubmissionDetail';

import {
  GROUP_URI_FACTORY,
  ASSIGNMENT_DETAIL_URI_FACTORY,
  SUBMISSION_DETAIL_URI_FACTORY
} from '../../links';

import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchSubmissionIfNeeded } from '../../redux/modules/submissions';

class Submission extends Component {

  componentWillMount() {
    Submission.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.submissionId !== newProps.params.submissionId) {
      Submission.loadData(newProps);
    }
  }

  static loadData = ({
    params: { submissionId, assignmentId },
    loadSubmission,
    loadAssignment
  }) => {
    loadSubmission(submissionId);
    loadAssignment(assignmentId);
  };

  closeSourceCodeViewer = () => {
    const { assignmentId, submissionId } = this.props.params;
    const link = SUBMISSION_DETAIL_URI_FACTORY(assignmentId, submissionId);
    this.context.router.push(link);
  };

  render() {
    const {
      assignment,
      submission,
      evaluation,
      params: { submissionId, assignmentId },
      children
    } = this.props;

    const assignmentName = isReady(assignment) ? assignment.data.name : null;
    const title = assignmentName !== null ? assignmentName : 'Načítám ...';

    return (
      <PageContent
        title={title}
        description={<FormattedMessage id='app.submission.evaluation.title' defaultMessage='Your solution evaluation' />}
        breadcrumbs={[
          { text: <FormattedMessage id='app.group.title' defaultMessage='Group detail' />, iconName: 'user', link: isReady(assignment) ? GROUP_URI_FACTORY(assignment.data.groupId) : undefined },
          { text: <FormattedMessage id='app.assignment.title' defaultMessage='Exercise assignment' />, iconName: 'puzzle-piece', link: ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId) },
          { text: <FormattedMessage id='app.submission.title' defaultMessage='Your solution' />, iconName: '' }
        ]}>
        <div>
          {isLoading(submission) && <LoadingSubmissionDetail />}
          {hasFailed(submission) && <FailedSubmissionDetail />}
          {isReady(submission) &&
            <SubmissionDetail
              {...submission.data}
              assignmentId={assignmentId}
              assignment={assignment}
              onCloseSourceViewer={this.closeSourceCodeViewer}>
              {children}
            </SubmissionDetail>
          }
        </div>
      </PageContent>
    );
  }

}

Submission.contextTypes = {
  router: PropTypes.object.isRequired
};

Submission.propTypes = {
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired,
    submissionId: PropTypes.string.isRequired
  }).isRequired,
  submission: PropTypes.object,
  loadSubmission: PropTypes.func.isRequired,
  loadAssignment: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({
    submission: state.submissions.getIn([ 'resources', props.params.submissionId ]),
    assignment: state.assignments.getIn([ 'resources', props.params.assignmentId ])
  }),
  (dispatch) => ({
    loadSubmission: (submissionId) => dispatch(fetchSubmissionIfNeeded(submissionId)),
    loadAssignment: (assignmentId) => dispatch(fetchAssignmentIfNeeded(assignmentId))
  })
)(Submission);
