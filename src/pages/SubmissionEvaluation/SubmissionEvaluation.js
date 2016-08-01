import React, { PropTypes, Component } from 'react';
import { asyncConnect } from 'redux-connect';
import Helmet from 'react-helmet';
import { Grid, Col, Row } from 'react-bootstrap';

import { submissionStatus } from '../../redux/modules/submission';

import PageContent from '../../components/PageContent';
import AssignmentDetails from '../../components/AssignmentDetails';
import SubmitSolutionButton from '../../components/SubmitSolutionButton';
import SubmissionsTable from '../../components/SubmissionsTable';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import EvaluationProgressContainer from '../../containers/EvaluationProgressContainer';

class Submission extends Component {

  render() {
    const {
      submission,
      assignment,
      params: { assignmentId, submissionId }
    } = this.props;

    return (
      <PageContent title={`${assignment.title} - vyhodnocení řešení`}>
        <Row>
          <Col lg={6}>
            <AssignmentDetails
              assignment={assignment} />
          </Col>
          <Col lg={6}>
          </Col>
        </Row>
      </PageContent>
    );
  }

}

export default asyncConnect(
  [

  ],
  state => ({
    isProcessingModalOpen: state.submission.get('status') === submissionStatus.SENDING
      || state.submission.get('status') === submissionStatus.PROCESSING,
    channelId: state.submission.get('webSocketChannel')
  })
)(Assignment);
