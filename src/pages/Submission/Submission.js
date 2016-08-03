import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import Helmet from 'react-helmet';

import PageContent from '../../components/PageContent';
import SubmissionDetail, {
  LoadingSubmissionDetail,
  FailedSubmissionDetail
} from '../../components/SubmissionDetail';
import { ASSIGNMENT_DETAIL_URI_FACTORY } from '../../links';

import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchSubmission } from '../../redux/modules/submissions';

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
    params: { submissionId },
    loadSubmission
  }) => {
    loadSubmission(submissionId);
  };

  render() {
    const {
      assignment,
      submission
    } = this.props;

    return (
      <div>
        <Helmet title='Řešení' description='Vyhodnocení odevzdaného řešení' />
        {isLoading(submission) && <LoadingSubmissionDetail />}
        {hasFailed(submission) && <FailedSubmissionDetail />}
        {isReady(submission) && <SubmissionDetail {...submission.data} />}
      </div>
    );
  }

}

Submission.propTypes = {
  params: PropTypes.shape({
    submissionId: PropTypes.string.isRequired
  }).isRequired,
  submission: PropTypes.object,
  loadSubmission: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({
    submission: state.submissions.getIn([ 'resources', props.params.submissionId ])
  }),
  (dispatch) => ({
    loadSubmission: (submissionId) => dispatch(fetchSubmission(submissionId))
  })
)(Submission);
