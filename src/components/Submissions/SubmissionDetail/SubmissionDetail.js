import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';

import SubmissionStatus from '../SubmissionStatus';
import SourceCodeInfoBox from '../../widgets/SourceCodeInfoBox';
import TestResults from '../TestResults';
import BonusPointsContainer from '../../../containers/BonusPointsContainer';
import DownloadResultArchiveContainer from '../../../containers/DownloadResultArchiveContainer';
import CommentThreadContainer from '../../../containers/CommentThreadContainer';
import SourceCodeViewerContainer from '../../../containers/SourceCodeViewerContainer';
import SubmissionEvaluations from '../SubmissionEvaluations';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import EvaluationDetail from '../EvaluationDetail';
import CompilationLogs from '../CompilationLogs';

class SubmissionDetail extends Component {
  state = { openFileId: null, activeSubmissionId: null };
  openFile = id => this.setState({ openFileId: id });
  hideFile = () => this.setState({ openFileId: null });

  componentWillMount() {
    this.setState({
      activeSubmissionId: this.props.submission.lastSubmission
        ? this.props.submission.lastSubmission.id
        : null
    });
  }

  render() {
    const {
      submission: {
        id,
        note = '',
        solution: { createdAt, userId, files, ...restSolution },
        maxPoints,
        bonusPoints,
        accepted,
        runtimeEnvironmentId
      },
      assignment,
      isSupervisor,
      evaluations
    } = this.props;
    const { openFileId, activeSubmissionId } = this.state;

    if (activeSubmissionId) {
      var {
        submittedBy,
        evaluation,
        isCorrect,
        evaluationStatus,
        ...restSub
      } = evaluations.toJS()[activeSubmissionId].data;
    } else evaluationStatus = 'missing-submission';
    return (
      <div>
        <Row>
          <Col md={6} sm={12}>
            <SubmissionStatus
              evaluationStatus={evaluationStatus}
              submittedAt={createdAt}
              userId={userId}
              submittedBy={submittedBy}
              note={note}
              accepted={accepted}
              originalSubmissionId={restSolution.id}
              assignmentId={assignment.id}
            />
            <Row>
              {files.map(file =>
                <Col lg={6} md={12} key={file.id}>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      this.openFile(file.id);
                    }}
                  >
                    <SourceCodeInfoBox {...file} />
                  </a>
                </Col>
              )}
            </Row>
            {evaluation &&
              <CompilationLogs
                initiationOutputs={evaluation.initiationOutputs}
              />}
            <CommentThreadContainer threadId={id} />
          </Col>

          {evaluations &&
            <Col md={6} sm={12}>
              {evaluation &&
                <EvaluationDetail
                  assignment={assignment}
                  evaluation={evaluation}
                  submittedAt={createdAt}
                  maxPoints={maxPoints}
                  isCorrect={isCorrect}
                  bonusPoints={bonusPoints}
                />}

              {evaluation &&
                isSupervisor &&
                <BonusPointsContainer
                  submissionId={id}
                  bonusPoints={bonusPoints}
                />}

              {evaluation &&
                <TestResults
                  evaluation={evaluation}
                  runtimeEnvironmentId={runtimeEnvironmentId}
                />}

              {evaluation &&
                isSupervisor &&
                <Row>
                  <Col lg={6} md={12}>
                    <DownloadResultArchiveContainer submissionId={restSub.id} />
                  </Col>
                </Row>}
              {activeSubmissionId &&
                isSupervisor &&
                <Row>
                  <Col lg={12}>
                    <ResourceRenderer resource={evaluations.toArray()}>
                      {(...evaluations) =>
                        <SubmissionEvaluations
                          submissionId={id}
                          evaluations={evaluations}
                          assignmentId={assignment.id}
                          activeSubmissionId={activeSubmissionId}
                          onSelect={id =>
                            this.setState({ activeSubmissionId: id })}
                        />}
                    </ResourceRenderer>
                  </Col>
                </Row>}
            </Col>}
        </Row>

        <SourceCodeViewerContainer
          show={openFileId !== null}
          fileId={openFileId}
          onHide={() => this.hideFile()}
        />
      </div>
    );
  }
}

SubmissionDetail.propTypes = {
  submission: PropTypes.shape({
    id: PropTypes.string.isRequired,
    note: PropTypes.string,
    lastSubmission: PropTypes.shape({ id: PropTypes.string.isRequired }),
    solution: PropTypes.shape({
      createdAt: PropTypes.number.isRequired,
      userId: PropTypes.string.isRequired,
      files: PropTypes.array
    }).isRequired,
    maxPoints: PropTypes.number.isRequired,
    runtimeEnvironmentId: PropTypes.string
  }).isRequired,
  assignment: PropTypes.object.isRequired,
  isSupervisor: PropTypes.bool,
  evaluations: PropTypes.object.isRequired
};

export default SubmissionDetail;
