import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';

import SubmissionStatus from '../SubmissionStatus';
import SourceCodeInfoBox from '../../SourceCodeInfoBox';
import LocalizedTexts from '../../LocalizedTexts';
import TestResults from '../TestResults';
import BonusPointsContainer from '../../../containers/BonusPointsContainer';
import DownloadResultArchiveContainer from '../../../containers/DownloadResultArchiveContainer';
import CommentThreadContainer from '../../../containers/CommentThreadContainer';
import SourceCodeViewerContainer from '../../../containers/SourceCodeViewerContainer';

import EvaluationDetail from '../EvaluationDetail';
import CompilationLogs from '../CompilationLogs';

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
        userId,
        submittedBy,
        maxPoints,
        files,
        evaluation
      },
      assignment,
      isSupervisor
    } = this.props;
    const { openFileId } = this.state;

    return (
      <div>
        <Row>
          <Col lg={4} md={6} sm={12}>
            <SubmissionStatus
              evaluationStatus={evaluationStatus}
              submittedAt={submittedAt}
              userId={userId}
              submittedBy={submittedBy}
              note={note} />
            <Row>
              {files.map(file => (
              <Col sm={6} key={file.id}>
                <a href='#' onClick={() => this.openFile(file.id)}>
                  <SourceCodeInfoBox {...file} />
                </a>
              </Col>
              ))}
            </Row>
            <CompilationLogs initiationOutputs={evaluation.initiationOutputs} />
            <CommentThreadContainer threadId={id} />
          </Col>

          {evaluation && (
            <Col lg={4} md={6} sm={12}>
              <EvaluationDetail
                assignment={assignment}
                evaluation={evaluation}
                submittedAt={submittedAt}
                maxPoints={maxPoints} />

              {isSupervisor && (
                <BonusPointsContainer submissionId={id} evaluation={evaluation} />
              )}

              {isSupervisor && (
                <Row>
                  <Col sm={6}>
                    <DownloadResultArchiveContainer submissionId={id} />
                  </Col>
                </Row>
              )}

              <TestResults evaluation={evaluation} />
            </Col>
          )}

          <Col lg={4} md={12} sm={12}>
            <LocalizedTexts locales={assignment.localizedTexts} />
          </Col>
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
    userId: PropTypes.string.isRequired,
    submittedBy: PropTypes.string,
    evaluation: PropTypes.object,
    maxPoints: PropTypes.number.isRequired,
    files: PropTypes.array
  }).isRequired,
  assignment: PropTypes.object.isRequired,
  isSupervisor: PropTypes.bool
};

SubmissionDetail.contextTypes = {
  links: PropTypes.object
};

export default SubmissionDetail;
