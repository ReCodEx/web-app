import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import SolutionStatus from '../SolutionStatus';
import TestResults from '../TestResults';
import PointsContainer from '../../../containers/PointsContainer';
import DownloadResultArchiveContainer from '../../../containers/DownloadResultArchiveContainer';
import CommentThreadContainer from '../../../containers/CommentThreadContainer';
import SourceCodeViewerContainer from '../../../containers/SourceCodeViewerContainer';
import SubmissionEvaluations from '../SubmissionEvaluations';
import { ScoreConfigInfoDialog } from '../../scoreConfig/ScoreConfigInfo';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import SolutionFiles from '../SolutionFiles';
import EvaluationDetail from '../EvaluationDetail';
import CompilationLogs from '../CompilationLogs';
import { RefreshIcon } from '../../icons';
import FailureReport from '../../SubmissionFailures/FailureReport';
import Button from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';

import { isStudentLocked } from '../../helpers/exams';
import { safeGet, EMPTY_OBJ } from '../../../helpers/common';

class SolutionDetail extends Component {
  state = {
    openFileId: null,
    openFileName: '',
    openZipEntry: null,
    activeSubmissionId: null,
    scoreDialogOpened: false,
  };

  setActiveSubmission = id => {
    this.props.fetchScoreConfigIfNeeded && this.props.fetchScoreConfigIfNeeded(id);
    this.setState({ activeSubmissionId: id });
  };

  openFile = (openFileId, openFileName, openZipEntry = null) =>
    this.setState({ openFileId, openFileName, openZipEntry });

  hideFile = () => this.setState({ openFileId: null, openFileName: '', openZipEntry: null });

  openScoreDialog = () => {
    const activeSubmissionId =
      this.state.activeSubmissionId || safeGet(this.props.solution.lastSubmission, ['id'], null);
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
        attemptIndex,
        note = '',
        createdAt,
        authorId,
        maxPoints,
        overriddenPoints,
        bonusPoints,
        actualPoints,
        accepted,
        review = null,
        runtimeEnvironmentId,
        lastSubmission,
        permissionHints = EMPTY_OBJ,
      },
      files,
      download,
      otherSolutions,
      assignment,
      evaluations,
      runtimeEnvironments,
      editNote = null,
      deleteEvaluation = null,
      refreshSolutionEvaluations = null,
      scoreConfigSelector = null,
      canResubmit = false,
      assignmentSolversLoading,
      assignmentSolverSelector,
      currentUser,
    } = this.props;

    const { openFileId, openFileName, openZipEntry, scoreDialogOpened } = this.state;
    const activeSubmissionId = this.state.activeSubmissionId || safeGet(lastSubmission, ['id'], null);
    const evaluationsJS = evaluations.toJS();
    if (activeSubmissionId && evaluationsJS[activeSubmissionId] && evaluationsJS[activeSubmissionId].data) {
      /* eslint-disable no-var */
      var { submittedBy, evaluation, failure, isDebug, ...restSub } = evaluationsJS[activeSubmissionId].data;
    }

    return (
      <div>
        <Row>
          <Col xl={6}>
            <SolutionStatus
              id={id}
              attemptIndex={attemptIndex}
              evaluation={evaluation}
              lastSubmission={lastSubmission}
              submittedAt={createdAt}
              userId={authorId}
              submittedBy={submittedBy}
              note={note}
              editNote={editNote}
              accepted={accepted}
              review={review}
              assignment={assignment}
              actualPoints={actualPoints}
              overriddenPoints={overriddenPoints}
              maxPoints={maxPoints}
              bonusPoints={bonusPoints}
              runtimeEnvironmentId={runtimeEnvironmentId}
              runtimeEnvironments={runtimeEnvironments}
              environment={
                runtimeEnvironments &&
                runtimeEnvironmentId &&
                runtimeEnvironments.find(({ id }) => id === runtimeEnvironmentId)
              }
              otherSolutions={otherSolutions}
              assignmentSolversLoading={assignmentSolversLoading}
              assignmentSolverSelector={assignmentSolverSelector}
            />
          </Col>
          <Col xl={6}>
            {!evaluation && !failure && refreshSolutionEvaluations && (
              <Callout variant="warning">
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
              </Callout>
            )}

            {failure && <FailureReport failure={failure} />}

            {activeSubmissionId !== safeGet(lastSubmission, ['id']) && (
              <Callout variant="warning">
                <FormattedMessage
                  id="app.evaluationDetail.notActualEvaluation"
                  defaultMessage="This is not the last evaluation. Please note, that the solution is scored by the evaluaton of the last submission. You may change the selection of the evaluation being displayed in the table at the bottom."
                />
              </Callout>
            )}

            {evaluation && (
              <EvaluationDetail
                evaluation={evaluation}
                maxPoints={maxPoints}
                isDebug={isDebug}
                viewResumbissions={permissionHints.viewResubmissions}
                showScoreDetail={this.openScoreDialog}
              />
            )}
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <SolutionFiles
              solutionId={id}
              attemptIndex={attemptIndex}
              files={files}
              authorId={authorId}
              openFile={this.openFile}
              download={download}
            />

            {permissionHints.setBonusPoints && (
              <PointsContainer
                submissionId={id}
                overriddenPoints={overriddenPoints}
                bonusPoints={bonusPoints}
                scoredPoints={safeGet(lastSubmission, ['evaluation', 'points'])}
                maxPoints={maxPoints}
                maxPointsEver={
                  assignment.allowSecondDeadline
                    ? Math.max(assignment.maxPointsBeforeFirstDeadline, assignment.maxPointsBeforeSecondDeadline)
                    : assignment.maxPointsBeforeFirstDeadline
                }
              />
            )}

            {!isStudentLocked(currentUser) && (
              <CommentThreadContainer
                threadId={id}
                additionalPublicSwitchNote={
                  <FormattedMessage
                    id="app.solutionDetail.comments.additionalSwitchNote"
                    defaultMessage="(author of the solution and supervisors of this group)"
                  />
                }
              />
            )}
          </Col>

          {evaluations && (
            <Col xl={6}>
              {evaluation && <CompilationLogs initiationOutputs={evaluation.initiationOutputs} />}

              {evaluation && (
                <TestResults
                  evaluation={evaluation}
                  runtimeEnvironmentId={runtimeEnvironmentId}
                  showJudgeLogStdout={permissionHints.viewEvaluationJudgeStdout}
                  showJudgeLogStderr={permissionHints.viewEvaluationJudgeStderr}
                  isJudgeLogStdoutPublic={assignment.canViewJudgeStdout}
                  isJudgeLogStderrPublic={assignment.canViewJudgeStderr}
                  isJudgeLogMerged={assignment.mergeJudgeLogs}
                />
              )}

              {evaluation && permissionHints.downloadResultArchive && (
                <Row>
                  <Col lg={6} md={12}>
                    <DownloadResultArchiveContainer submissionId={restSub.id} />
                  </Col>
                </Row>
              )}

              {activeSubmissionId && permissionHints.viewResubmissions && evaluations && evaluations.size > 1 && (
                <Row>
                  <Col lg={12}>
                    <ResourceRenderer resource={evaluations.toArray()} returnAsArray>
                      {evaluations => (
                        <SubmissionEvaluations
                          submissionId={id}
                          evaluations={evaluations}
                          activeSubmissionId={activeSubmissionId}
                          onSelect={this.setActiveSubmission}
                          onDelete={permissionHints.deleteEvaluation ? deleteEvaluation : null}
                          confirmDeleteLastSubmit
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
          show={openFileId !== null}
          fileId={openFileId || ''}
          fileName={openFileName}
          zipEntry={openZipEntry}
          files={files}
          openAnotherFile={this.openFile}
          onHide={this.hideFile}
          submittedBy={authorId}
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

SolutionDetail.propTypes = {
  solution: PropTypes.shape({
    id: PropTypes.string.isRequired,
    attemptIndex: PropTypes.number.isRequired,
    note: PropTypes.string,
    lastSubmission: PropTypes.shape({ id: PropTypes.string.isRequired }),
    createdAt: PropTypes.number.isRequired,
    authorId: PropTypes.string.isRequired,
    maxPoints: PropTypes.number.isRequired,
    bonusPoints: PropTypes.number.isRequired,
    overriddenPoints: PropTypes.number,
    actualPoints: PropTypes.number,
    accepted: PropTypes.bool.isRequired,
    review: PropTypes.shape({
      startedAt: PropTypes.number,
      closedAt: PropTypes.number,
      issues: PropTypes.number,
    }),
    runtimeEnvironmentId: PropTypes.string,
    permissionHints: PropTypes.object,
  }).isRequired,
  files: ImmutablePropTypes.map,
  download: PropTypes.func,
  otherSolutions: ImmutablePropTypes.list.isRequired,
  assignmentSolversLoading: PropTypes.bool,
  assignmentSolverSelector: PropTypes.func.isRequired,
  assignment: PropTypes.object.isRequired,
  evaluations: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  runtimeEnvironments: PropTypes.array,
  editNote: PropTypes.func,
  deleteEvaluation: PropTypes.func,
  refreshSolutionEvaluations: PropTypes.func,
  scoreConfigSelector: PropTypes.func,
  fetchScoreConfigIfNeeded: PropTypes.func,
  canResubmit: PropTypes.bool,
};

export default SolutionDetail;
