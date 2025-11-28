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
import { WarningIcon } from '../../icons';
import FailureReport from '../../SubmissionFailures/FailureReport';
import RefreshButton from '../../buttons/RefreshButton/RefreshButton';
import Callout from '../../widgets/Callout';

import { isStudentLocked } from '../../helpers/exams.js';
import { safeGet, EMPTY_OBJ } from '../../../helpers/common.js';

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
      solution,
      files,
      download,
      otherSolutions,
      exercise = null,
      assignment = null,
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

    const {
      id,
      runtimeEnvironmentId,
      lastSubmission,
      permissionHints = EMPTY_OBJ,
      authorId,
      description = null,
      note = null,
      attemptIndex = null,
      maxPoints = null,
      overriddenPoints = null,
      bonusPoints = null,
    } = solution;

    const { openFileId, openFileName, openZipEntry, scoreDialogOpened } = this.state;
    const activeSubmissionId = this.state.activeSubmissionId || safeGet(lastSubmission, ['id'], null);
    const evaluationsJS = evaluations.toJS();
    if (activeSubmissionId && evaluationsJS[activeSubmissionId] && evaluationsJS[activeSubmissionId].data) {
      /* eslint-disable no-var */
      var { submittedBy, evaluation, failure, isDebug, ...restSub } = evaluationsJS[activeSubmissionId].data;
    }

    const referenceSolution = exercise !== null;

    return (
      <div>
        <Row>
          <Col xl={6}>
            <SolutionStatus
              solution={solution}
              referenceSolution={referenceSolution}
              evaluation={evaluation}
              submittedBy={submittedBy}
              note={referenceSolution ? description : note}
              editNote={editNote}
              assignment={assignment}
              runtimeEnvironments={runtimeEnvironments}
              otherSolutions={otherSolutions}
              assignmentSolversLoading={assignmentSolversLoading}
              assignmentSolverSelector={assignmentSolverSelector}
            />
          </Col>
          <Col xl={6}>
            {referenceSolution && !evaluation && (!evaluations || evaluations.size === 0) && (
              <Callout variant="danger" icon={<WarningIcon />}>
                <FormattedMessage
                  id="app.submissionEvaluation.noEvaluationsWhatSoEver"
                  defaultMessage="There are no submission evaluations. This is highly unusual, since the solution is submitted for evaluation as soon as it is created. Check the configuration of the exercise and try to resubmit this solution again."
                />
              </Callout>
            )}

            {!evaluation && !failure && refreshSolutionEvaluations && (
              <Callout variant="warning">
                <table>
                  <tbody>
                    <tr>
                      <td width="100%" className="pe-3">
                        <FormattedMessage
                          id="app.submissionEvaluation.noEvaluationYet"
                          defaultMessage="The evaluation is not available yet. Click the refresh button for an update."
                        />
                      </td>
                      <td>
                        <RefreshButton onClick={refreshSolutionEvaluations} variant="primary" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Callout>
            )}

            {failure && <FailureReport failure={failure} />}

            {!referenceSolution && activeSubmissionId !== safeGet(lastSubmission, ['id']) && (
              <Callout variant="warning">
                <FormattedMessage
                  id="app.evaluationDetail.notActualEvaluation"
                  defaultMessage="This is not the last evaluation. Please note, that the solution is scored by the evaluation of the last submission. You may change the selection of the evaluation being displayed in the table at the bottom."
                />
              </Callout>
            )}

            {evaluation && (
              <EvaluationDetail
                evaluation={evaluation}
                maxPoints={maxPoints}
                isDebug={isDebug}
                viewResubmissions={permissionHints.viewResubmissions}
                showScoreDetail={this.openScoreDialog}
                referenceSolution={referenceSolution}
              />
            )}
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <SolutionFiles
              solutionId={id}
              files={files}
              authorId={authorId}
              isReference={referenceSolution}
              attemptIndex={attemptIndex}
              openFile={this.openFile}
              download={download}
            />

            {!referenceSolution && assignment && permissionHints.setBonusPoints && (
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
                  referenceSolution ? (
                    <FormattedMessage
                      id="app.referenceSolutionDetail.comments.additionalSwitchNote"
                      defaultMessage="(teachers who can see this reference solution)"
                    />
                  ) : (
                    <FormattedMessage
                      id="app.solutionDetail.comments.additionalSwitchNote"
                      defaultMessage="(author of the solution and supervisors of this group)"
                    />
                  )
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
                  showJudgeLogStdout={referenceSolution || permissionHints.viewEvaluationJudgeStdout}
                  showJudgeLogStderr={referenceSolution || permissionHints.viewEvaluationJudgeStderr}
                  isJudgeLogStdoutPublic={referenceSolution ? null : assignment.canViewJudgeStdout}
                  isJudgeLogStderrPublic={referenceSolution ? null : assignment.canViewJudgeStderr}
                  isJudgeLogMerged={(assignment || exercise).mergeJudgeLogs}
                />
              )}

              {evaluation && permissionHints[referenceSolution ? 'viewDetail' : 'downloadResultArchive'] && (
                <Row>
                  <Col lg={6} md={12}>
                    <DownloadResultArchiveContainer submissionId={restSub.id} isReference={referenceSolution} />
                  </Col>
                </Row>
              )}

              {activeSubmissionId &&
                (referenceSolution || permissionHints.viewResubmissions) &&
                evaluations &&
                evaluations.size > 1 && (
                  <Row>
                    <Col lg={12}>
                      <ResourceRenderer resourceArray={evaluations}>
                        {evaluations => (
                          <SubmissionEvaluations
                            submissionId={id}
                            evaluations={evaluations}
                            activeSubmissionId={activeSubmissionId}
                            showInfo={!referenceSolution}
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
          files={files}
          show={openFileId !== null}
          fileId={openFileId || ''}
          fileName={openFileName}
          zipEntry={openZipEntry}
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
    // common part for both solution types
    id: PropTypes.string.isRequired,
    runtimeEnvironmentId: PropTypes.string,
    lastSubmission: PropTypes.shape({ id: PropTypes.string.isRequired }),
    createdAt: PropTypes.number.isRequired,
    authorId: PropTypes.string.isRequired,
    permissionHints: PropTypes.object,
    // specific to assignment solutions only
    note: PropTypes.string,
    attemptIndex: PropTypes.number,
    maxPoints: PropTypes.number,
    bonusPoints: PropTypes.number,
    overriddenPoints: PropTypes.number,
    actualPoints: PropTypes.number,
    accepted: PropTypes.bool,
    review: PropTypes.shape({
      startedAt: PropTypes.number,
      closedAt: PropTypes.number,
      issues: PropTypes.number,
    }),
    // specific to reference solutions only
    description: PropTypes.string,
    visibility: PropTypes.number,
  }).isRequired,
  files: ImmutablePropTypes.map,
  evaluations: PropTypes.object.isRequired,
  runtimeEnvironments: PropTypes.array,
  currentUser: PropTypes.object.isRequired,
  exercise: PropTypes.object,
  otherSolutions: ImmutablePropTypes.list,
  assignmentSolversLoading: PropTypes.bool,
  assignmentSolverSelector: PropTypes.func,
  assignment: PropTypes.object,
  editNote: PropTypes.func,
  scoreConfigSelector: PropTypes.func,
  download: PropTypes.func,
  deleteEvaluation: PropTypes.func,
  refreshSolutionEvaluations: PropTypes.func,
  fetchScoreConfigIfNeeded: PropTypes.func,
  canResubmit: PropTypes.bool,
};

export default SolutionDetail;
