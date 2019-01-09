import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import SolutionStatus from '../SolutionStatus';
import SourceCodeInfoBox from '../../widgets/SourceCodeInfoBox';
import TestResults from '../TestResults';
import PointsContainer from '../../../containers/PointsContainer';
import DownloadResultArchiveContainer from '../../../containers/DownloadResultArchiveContainer';
import DownloadSolutionArchiveContainer from '../../../containers/DownloadSolutionArchiveContainer';
import CommentThreadContainer from '../../../containers/CommentThreadContainer';
import SourceCodeViewerContainer from '../../../containers/SourceCodeViewerContainer';
import SubmissionEvaluations from '../SubmissionEvaluations';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import EvaluationDetail from '../EvaluationDetail';
import CompilationLogs from '../CompilationLogs';
import { WarningIcon, RefreshIcon } from '../../icons';
import Button from '../../widgets/FlatButton';

import { safeGet, EMPTY_OBJ } from '../../../helpers/common';

class SolutionDetail extends Component {
  state = { openFileId: null, activeSubmissionId: null };
  openFile = id => this.setState({ openFileId: id });
  hideFile = () => this.setState({ openFileId: null });

  render() {
    const {
      solution: {
        id,
        note = '',
        solution: { createdAt, userId, files },
        maxPoints,
        overriddenPoints,
        bonusPoints,
        actualPoints,
        accepted,
        runtimeEnvironmentId,
        lastSubmission,
        permissionHints = EMPTY_OBJ
      },
      assignment,
      evaluations,
      runtimeEnvironments,
      deleteEvaluation = null,
      refreshSolutionEvaluations = null
    } = this.props;

    const { openFileId } = this.state;
    const activeSubmissionId =
      this.state.activeSubmissionId || safeGet(lastSubmission, ['id'], null);
    const evaluationsJS = evaluations.toJS();
    if (
      activeSubmissionId &&
      evaluationsJS[activeSubmissionId] &&
      evaluationsJS[activeSubmissionId].data
    ) {
      var {
        submittedBy,
        evaluation,
        isCorrect,
        evaluationStatus,
        isDebug,
        ...restSub
      } = evaluationsJS[activeSubmissionId].data;
    } else {
      evaluationStatus = 'missing-submission';
    }

    return (
      <div>
        <Row>
          <Col md={6} sm={12}>
            <SolutionStatus
              evaluationStatus={safeGet(
                lastSubmission,
                ['evaluationStatus'],
                'missing-submission'
              )}
              submittedAt={createdAt}
              userId={userId}
              submittedBy={submittedBy}
              note={note}
              accepted={accepted}
              assignment={assignment}
              actualPoints={actualPoints}
              maxPoints={maxPoints}
              bonusPoints={bonusPoints}
              environment={
                runtimeEnvironments &&
                runtimeEnvironmentId &&
                runtimeEnvironments.find(
                  ({ id }) => id === runtimeEnvironmentId
                )
              }
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
              {files.length > 1 &&
                <Col lg={6} md={12}>
                  <DownloadSolutionArchiveContainer solutionId={id} />
                </Col>}
            </Row>
            {permissionHints.setBonusPoints &&
              <PointsContainer
                submissionId={id}
                overriddenPoints={overriddenPoints}
                bonusPoints={bonusPoints}
                scoredPoints={safeGet(lastSubmission, ['evaluation', 'points'])}
                maxPoints={maxPoints}
              />}

            <CommentThreadContainer threadId={id} />
          </Col>

          {evaluations &&
            <Col md={6} sm={12}>
              {!evaluation &&
                refreshSolutionEvaluations &&
                <div className="callout callout-warning">
                  <table>
                    <tbody>
                      <tr>
                        <td width="100%" className="em-padding-right">
                          <FormattedMessage
                            id="app.submissionEvaluation.noEvaluationYet"
                            defaultMessage="The evaluation is not available yet. Click the refresh button for an update."
                          />
                        </td>
                        <td>
                          <Button
                            onClick={refreshSolutionEvaluations}
                            bsStyle="primary"
                          >
                            <RefreshIcon gapRight />
                            <FormattedMessage
                              id="generic.refresh"
                              defaultMessage="Refresh"
                            />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>}

              {activeSubmissionId !== safeGet(lastSubmission, ['id']) &&
                <p className="callout callout-warning">
                  <WarningIcon gapRight />
                  <FormattedMessage
                    id="app.evaluationDetail.notActualEvaluation"
                    defaultMessage="This is not the last evaluation. Please note, that the solution is scored by the evaluaton of the last submission. You may change the selection of the evaluation being displayed in the table at the bottom."
                  />
                </p>}

              {evaluation &&
                <EvaluationDetail
                  evaluation={evaluation}
                  submittedAt={createdAt}
                  maxPoints={maxPoints}
                  isCorrect={isCorrect}
                  accepted={accepted}
                  evaluationStatus={evaluationStatus}
                  isDebug={isDebug}
                  viewResumbissions={permissionHints.viewResubmissions}
                />}

              {evaluation &&
                <CompilationLogs
                  initiationOutputs={evaluation.initiationOutputs}
                />}

              {evaluation &&
                <TestResults
                  evaluation={evaluation}
                  runtimeEnvironmentId={runtimeEnvironmentId}
                  showJudgeLog={permissionHints.viewEvaluationJudgeOutput}
                />}

              {evaluation &&
                permissionHints.downloadResultArchive &&
                <Row>
                  <Col lg={6} md={12}>
                    <DownloadResultArchiveContainer submissionId={restSub.id} />
                  </Col>
                </Row>}

              {activeSubmissionId &&
                permissionHints.viewResubmissions &&
                evaluations &&
                evaluations.size > 1 &&
                <Row>
                  <Col lg={12}>
                    <ResourceRenderer
                      resource={evaluations.toArray()}
                      returnAsArray
                    >
                      {evaluations =>
                        <SubmissionEvaluations
                          submissionId={id}
                          evaluations={evaluations}
                          activeSubmissionId={activeSubmissionId}
                          onSelect={id =>
                            this.setState({ activeSubmissionId: id })}
                          onDelete={
                            permissionHints.deleteEvaluation
                              ? deleteEvaluation
                              : null
                          }
                          confirmDeleteLastSubmit
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

SolutionDetail.propTypes = {
  solution: PropTypes.shape({
    id: PropTypes.string.isRequired,
    note: PropTypes.string,
    lastSubmission: PropTypes.shape({ id: PropTypes.string.isRequired }),
    solution: PropTypes.shape({
      createdAt: PropTypes.number.isRequired,
      userId: PropTypes.string.isRequired,
      files: PropTypes.array
    }).isRequired,
    maxPoints: PropTypes.number.isRequired,
    bonusPoints: PropTypes.number.isRequired,
    overriddenPoints: PropTypes.number,
    actualPoints: PropTypes.number,
    runtimeEnvironmentId: PropTypes.string,
    permissionHints: PropTypes.object
  }).isRequired,
  assignment: PropTypes.object.isRequired,
  evaluations: PropTypes.object.isRequired,
  runtimeEnvironments: PropTypes.array,
  deleteEvaluation: PropTypes.func,
  refreshSolutionEvaluations: PropTypes.func
};

export default SolutionDetail;
