import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import EvaluationDetail from '../../Solutions/EvaluationDetail';
import TestResults from '../../Solutions/TestResults';
import DownloadResultArchiveContainer from '../../../containers/DownloadResultArchiveContainer';
import DownloadSolutionArchiveContainer from '../../../containers/DownloadSolutionArchiveContainer';
import CommentThreadContainer from '../../../containers/CommentThreadContainer';
import SourceCodeViewerContainer from '../../../containers/SourceCodeViewerContainer';
import SubmissionEvaluations from '../../Solutions/SubmissionEvaluations';
import { ScoreConfigInfoDialog } from '../../scoreConfig/ScoreConfigInfo';
import CompilationLogs from '../../Solutions/CompilationLogs';
import ReferenceSolutionStatus from '../ReferenceSolutionStatus/ReferenceSolutionStatus';

import SourceCodeInfoBox from '../../widgets/SourceCodeInfoBox';
import Button from '../../widgets/TheButton';
import DateTime from '../../widgets/DateTime';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import Icon, { RefreshIcon, WarningIcon, EvaluationFailedIcon } from '../../icons';

import { EMPTY_OBJ, getFirstItemInOrder } from '../../../helpers/common';

const getLastSubmissionId = evaluations => {
  const evalArray = Object.values(evaluations)
    .map(x => x.data)
    .filter(a => a.submittedAt);
  const first = getFirstItemInOrder(evalArray, (a, b) => b.submittedAt - a.submittedAt);
  return first && first.id;
};

class ReferenceSolutionDetail extends Component {
  state = { openFileId: null, activeSubmissionId: null, scoreDialogOpened: false };

  setActiveSubmission = id => {
    this.props.fetchScoreConfigIfNeeded && this.props.fetchScoreConfigIfNeeded(id);
    this.setState({ activeSubmissionId: id });
  };

  openFile = id => this.setState({ openFileId: id });

  hideFile = () => this.setState({ openFileId: null });

  openScoreDialog = () => {
    const evaluationsJS = this.props.evaluations && this.props.evaluations.toJS();
    const activeSubmissionId = evaluationsJS && (this.state.activeSubmissionId || getLastSubmissionId(evaluationsJS));
    if (activeSubmissionId) {
      this.props.fetchScoreConfigIfNeeded && this.props.fetchScoreConfigIfNeeded(activeSubmissionId);
      this.setState({ scoreDialogOpened: true });
    }
  };

  closeScoreDialog = () => this.setState({ scoreDialogOpened: false });

  render() {
    const {
      solution: {
        id,
        description,
        runtimeEnvironmentId,
        solution: { createdAt, userId, files },
        permissionHints = EMPTY_OBJ,
      },
      exercise,
      evaluations,
      deleteEvaluation = null,
      refreshSolutionEvaluations = null,
      runtimeEnvironments,
      scoreConfigSelector = null,
      canResubmit = false,
    } = this.props;
    const { openFileId, scoreDialogOpened } = this.state;
    const evaluationsJS = evaluations && evaluations.toJS();
    const activeSubmissionId = evaluationsJS && (this.state.activeSubmissionId || getLastSubmissionId(evaluationsJS));

    if (activeSubmissionId && evaluationsJS[activeSubmissionId] && evaluationsJS[activeSubmissionId].data) {
      /* eslint-disable no-var */
      var { submittedBy, evaluation, failure, isCorrect, evaluationStatus, isDebug, ...restSub } =
        evaluationsJS[activeSubmissionId].data;
    } else evaluationStatus = 'missing-submission';

    const filesSize = files.reduce((acc, { size }) => acc + size, 0);

    if (evaluationStatus === 'evaluation-failed' && !failure) {
      failure = true;
    }

    return (
      <div>
        <Row>
          <Col md={6} sm={12}>
            <ReferenceSolutionStatus
              description={description}
              submittedAt={createdAt}
              userId={userId}
              submittedBy={submittedBy}
              exerciseId={exercise.id}
              environment={
                runtimeEnvironments &&
                runtimeEnvironmentId &&
                runtimeEnvironments.find(({ id }) => id === runtimeEnvironmentId)
              }
            />

            {exercise.solutionFilesLimit !== null && files.length > exercise.solutionFilesLimit && (
              <div className="callout callout-warning">
                <WarningIcon gapRight />
                <FormattedMessage
                  id="app.referenceSolutionDetail.solutionFilesLimitExceeded"
                  defaultMessage="The total number of submitted files exceeds the default solution files limit ({limit})."
                  values={{ limit: exercise.solutionFilesLimit }}
                />
              </div>
            )}

            {exercise.solutionSizeLimit !== null && filesSize > exercise.solutionSizeLimit && (
              <div className="callout callout-warning">
                <WarningIcon gapRight />
                <FormattedMessage
                  id="app.referenceSolutionDetail.solutionSizeLimitExceeded"
                  defaultMessage="The total size of all submitted files exceeds the default solution size limit ({limit} KiB)."
                  values={{ limit: Math.ceil(exercise.solutionSizeLimit / 1024) }}
                />
              </div>
            )}

            <Row>
              {files
                .sort((a, b) => a.name.localeCompare(b.name, 'en'))
                .map(file => (
                  <Col lg={6} md={12} key={file.id}>
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        this.openFile(file.id);
                      }}>
                      <SourceCodeInfoBox {...file} />
                    </a>
                  </Col>
                ))}
              {files.length > 1 && (
                <Col lg={6} md={12}>
                  <DownloadSolutionArchiveContainer solutionId={id} isReference={true} />
                </Col>
              )}
            </Row>

            <CommentThreadContainer threadId={id} />
          </Col>

          {evaluations && (
            <Col md={6} sm={12}>
              {!evaluation && (!evaluations || evaluations.size === 0) && (
                <div className="callout callout-danger">
                  <WarningIcon gapRight />
                  <FormattedMessage
                    id="app.submissionEvaluation.noEvaluationsWhatSoEver"
                    defaultMessage="There are no submission evaluations. This is higly unusual, since the solution is submitted for evaluation as soon as it is created. Check the configuration of the exercise and try to resubmit this solution again."
                  />
                </div>
              )}

              {!evaluation && !failure && evaluations && evaluations.size > 0 && refreshSolutionEvaluations && (
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
                          <Button onClick={refreshSolutionEvaluations} variant="primary">
                            <RefreshIcon gapRight />
                            <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {failure && (
                <>
                  <div className="callout callout-danger">
                    <h4>
                      <EvaluationFailedIcon gapRight />
                      <FormattedMessage
                        id="app.submissionEvaluation.evaluationFailedHeading"
                        defaultMessage="The evaluation has failed!"
                      />
                    </h4>

                    {typeof failure === 'object' ? (
                      <p>
                        <FormattedMessage
                          id="app.submissionEvaluation.evaluationFailedMessage"
                          defaultMessage="Backend message"
                        />
                        : <em>{failure.description}</em>
                      </p>
                    ) : (
                      <p>
                        <FormattedMessage
                          id="app.submissionEvaluation.evaluationFailedInternalError"
                          defaultMessage="Internal backend error."
                        />
                      </p>
                    )}
                  </div>

                  {Boolean(typeof failure === 'object' && failure.resolvedAt && failure.resolutionNote) && (
                    <div className="callout callout-success">
                      <span className="small float-right">
                        (<DateTime unixts={failure.resolvedAt} />)
                      </span>
                      <h4>
                        <Icon icon="fire-extinguisher" gapRight />
                        <FormattedMessage
                          id="app.submissionEvaluation.evaluationFailureResolved"
                          defaultMessage="The failure has been resolved by admin!"
                        />
                      </h4>
                      <p>
                        <FormattedMessage
                          id="app.submissionEvaluation.evaluationFailureResolvedNote"
                          defaultMessage="Resolution note"
                        />
                        : <em>{failure.resolutionNote}</em>
                      </p>
                    </div>
                  )}
                </>
              )}

              {evaluation && (
                <EvaluationDetail
                  evaluation={evaluation}
                  submittedAt={createdAt}
                  isCorrect={isCorrect}
                  isDebug={isDebug}
                  viewResumbissions
                  showScoreDetail={this.openScoreDialog}
                  referenceSolution
                />
              )}

              {evaluation && <CompilationLogs initiationOutputs={evaluation.initiationOutputs} />}

              {evaluation && (
                <TestResults
                  evaluation={evaluation}
                  runtimeEnvironmentId={runtimeEnvironmentId}
                  showJudgeLogStdout
                  showJudgeLogStderr
                  isJudgeLogMerged={exercise.mergeJudgeLogs}
                />
              )}

              {evaluation && (
                <Row>
                  <Col lg={6} md={12}>
                    <DownloadResultArchiveContainer submissionId={restSub.id} isReference={true} />
                  </Col>
                </Row>
              )}
              {activeSubmissionId && (
                <Row>
                  <Col lg={12}>
                    <ResourceRenderer resource={evaluations.toArray()} returnAsArray>
                      {evaluations => (
                        <SubmissionEvaluations
                          submissionId={id}
                          evaluations={evaluations}
                          activeSubmissionId={activeSubmissionId}
                          showInfo={false}
                          onSelect={this.setActiveSubmission}
                          onDelete={permissionHints.deleteEvaluation ? deleteEvaluation : null}
                        />
                      )}
                    </ResourceRenderer>
                  </Col>
                </Row>
              )}
            </Col>
          )}
        </Row>

        <SourceCodeViewerContainer
          solutionId={id}
          files={files}
          openAnotherFile={this.openFile}
          show={openFileId !== null}
          fileId={openFileId}
          isReference={true}
          onHide={this.hideFile}
          submittedBy={userId}
        />

        {activeSubmissionId && scoreConfigSelector && (
          <ScoreConfigInfoDialog
            show={scoreDialogOpened}
            onHide={this.closeScoreDialog}
            scoreConfig={scoreConfigSelector(activeSubmissionId)}
            testResults={evaluation && evaluation.testResults}
            canResubmit={canResubmit}
          />
        )}
      </div>
    );
  }
}

ReferenceSolutionDetail.propTypes = {
  solution: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string,
    runtimeEnvironmentId: PropTypes.string,
    note: PropTypes.string,
    lastSubmission: PropTypes.shape({ id: PropTypes.string.isRequired }),
    solution: PropTypes.shape({
      createdAt: PropTypes.number.isRequired,
      userId: PropTypes.string.isRequired,
      files: PropTypes.array,
    }).isRequired,
    submissions: PropTypes.array.isRequired,
    permissionHints: PropTypes.object,
  }).isRequired,
  exercise: PropTypes.object.isRequired,
  evaluations: PropTypes.object.isRequired,
  deleteEvaluation: PropTypes.func,
  refreshSolutionEvaluations: PropTypes.func,
  runtimeEnvironments: PropTypes.array,
  scoreConfigSelector: PropTypes.func,
  fetchScoreConfigIfNeeded: PropTypes.func,
  canResubmit: PropTypes.bool,
};

export default ReferenceSolutionDetail;
