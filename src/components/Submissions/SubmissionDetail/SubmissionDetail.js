import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import SubmissionStatus from '../SubmissionStatus';
import SourceCodeInfoBox from '../../SourceCodeInfoBox';
import LocalizedAssignments from '../../Assignments/Assignment/LocalizedAssignments';
import TestResults from '../TestResults';
import BonusPointsContainer from '../../../containers/BonusPointsContainer';
import CommentThreadContainer from '../../../containers/CommentThreadContainer';
import SourceCodeViewerContainer from '../../../containers/SourceCodeViewerContainer';

import EvaluationDetail from '../EvaluationDetail';

class SubmissionDetail extends Component {

  state = { openFileId: null };
  openFile = (id) => this.setState({ openFileId: id });
  hideFile = () => this.setState({ openFileId: null });

  render() {
    const {
      submission: {
        id,
        note = '',
        evaluationStatus,
        submittedAt,
        maxPoints,
        files,
        evaluation
      },
      assignment
    } = this.props;
    const { openFileId } = this.state;

    return (
      <div>
        <Row>
          <Col lg={4} md={6} sm={12}>
            <SubmissionStatus
              evaluationStatus={evaluationStatus}
              submittedAt={submittedAt}
              note={note} />
            <CommentThreadContainer threadId={id} />
          </Col>

          {evaluation && (
            <Col lg={4} md={6} sm={12}>
              <EvaluationDetail
                assignment={assignment}
                evaluation={evaluation}
                submittedAt={submittedAt}
                maxPoints={maxPoints} />
              <BonusPointsContainer submissionId={id} evaluation={evaluation} />
              <TestResults evaluation={evaluation} />
            </Col>
          )}

          <Col lg={4} md={6} sm={12}>
            <LocalizedAssignments locales={assignment.localizedAssignments} />
          </Col>
        </Row>

        {/*
          Source codes
          */}
        <Row>
          <Col xs={12}>
            <h2>
              <FormattedMessage id='app.submission.files.title' defaultMessage='Submitted files' />
            </h2>
          </Col>
        </Row>
        <Row>
          {files.map(file => (
          <Col lg={4} sm={6} key={file.id}>
            <SourceCodeInfoBox {...file} onClick={() => this.openFile(file.id)} />
          </Col>
          ))}
        </Row>

        <SourceCodeViewerContainer
          show={openFileId !== null}
          fileId={openFileId}
          onHide={() => this.hideFile()} />
      </div>
    );
  }

}

SubmissionDetail.propTypes = {
  submission: PropTypes.shape({
    id: PropTypes.string.isRequired,
    evaluationStatus: PropTypes.string.isRequired,
    note: PropTypes.string,
    submittedAt: PropTypes.number.isRequired,
    evaluation: PropTypes.object,
    maxPoints: PropTypes.number.isRequired,
    files: PropTypes.array
  }).isRequired,
  assignment: PropTypes.object.isRequired
};

SubmissionDetail.contextTypes = {
  links: PropTypes.object
};

export default SubmissionDetail;
