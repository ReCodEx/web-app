import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import App from '../App';
import SubmitSolution from '../../components/Solutions/SubmitSolution';
import EvaluationProgressContainer from '../EvaluationProgressContainer';
import { fetchUsersSolutions } from '../../redux/modules/solutions';
import {
  getNote,
  isProcessing,
  isSending,
  isValidating,
  hasFailed,
  getSubmittedSolutionId,
  getMonitorParams,
  getPresubmitEnvironments,
  getPresubmitVariables,
  getPresubmitCountLimitOK,
  getPresubmitSizeLimitOK,
  hasEntryPoint,
} from '../../redux/selectors/submission';

import {
  uploadedFilesSelector,
  removedUploadFilesSelector,
  allFilesUploadedSelector,
} from '../../redux/selectors/upload';
import { getProgressObserverId } from '../../redux/selectors/evaluationProgress';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { cancel, changeNote } from '../../redux/modules/submission';
import { reset as resetUpload } from '../../redux/modules/upload';

import withLinks from '../../helpers/withLinks';
import { canSubmit } from '../../redux/modules/canSubmit';
import { isEmptyObject } from '../../helpers/common';

class SubmitSolutionContainer extends Component {
  state = {
    selectedEnvironment: null,
    entryPoint: null,
  };

  static getDerivedStateFromProps({ presubmitEnvironments, uploadedFiles }, state) {
    const res = {}; // changes of state

    // Only check the selection, if presubmit environments are set ...
    if (presubmitEnvironments && presubmitEnvironments.length > 0) {
      let newEnv = state.selectedEnvironment;
      if (newEnv && !presubmitEnvironments.find(e => e.id === newEnv)) {
        newEnv = null; // selected env is not availabe anymore
      }
      if (!newEnv) {
        newEnv = presubmitEnvironments[0].id;
      }

      if (newEnv !== state.selectedEnvironment) {
        res.selectedEnvironment = newEnv;
      }
    }

    // If entry point is no longer valid ...
    if (state.entryPoint && uploadedFiles && !uploadedFiles.find(f => f.name === state.entryPoint)) {
      res.entryPoint = null;
    }

    return !isEmptyObject(res) ? res : null;
  }

  getEntryPoint = () => {
    const { uploadedFiles, presubmitVariables } = this.props;
    const { selectedEnvironment, entryPoint } = this.state;

    if (!hasEntryPoint(presubmitVariables, selectedEnvironment)) {
      return null;
    }

    const defaultEntryPoint = uploadedFiles && uploadedFiles.length > 0 && uploadedFiles.map(f => f.name).sort()[0];

    return entryPoint || defaultEntryPoint;
  };

  needsToSelectEntryPoint = () => {
    const { uploadedFiles, presubmitVariables } = this.props;
    const { selectedEnvironment, entryPoint } = this.state;
    return hasEntryPoint(presubmitVariables, selectedEnvironment) && !entryPoint && uploadedFiles.length > 1;
  };

  submit = () => {
    const { uploadedFiles, note, submitSolution } = this.props;
    const { selectedEnvironment } = this.state;

    submitSolution(note, uploadedFiles, selectedEnvironment, this.getEntryPoint(), this.getMyObserverId());
  };

  presubmit = ({ removeFile = null, restoreFile = null }) => {
    const { uploadedFiles, removedFiles, presubmitSolution } = this.props;
    let files = uploadedFiles;

    if (removeFile) {
      files = files.filter(f => f.name !== removeFile);
    }
    if (restoreFile) {
      const file = removedFiles.find(f => f.name === restoreFile);
      if (file) {
        files.push(file);
      }
    }

    presubmitSolution(files);
  };

  changeRuntimeEnvironment = selectedEnvironment => {
    this.setState({ selectedEnvironment });
  };

  changeEntryPoint = entryPoint => {
    this.setState({ entryPoint });
  };

  getMyObserverId = () => 'submit_' + this.props.id;

  isMeTheObserver = () => {
    const { progressObserverId } = this.props;
    return progressObserverId === this.getMyObserverId();
  };

  afterEvaluationFinishes = () => {
    const {
      id,
      submissionId,
      isReferenceSolution = false,
      afterEvaluationFinishes,
      history: { push },
      links: { EXERCISE_REFERENCE_SOLUTION_URI_FACTORY, SOLUTION_DETAIL_URI_FACTORY },
    } = this.props;
    App.ignoreNextLocationChange();
    return isReferenceSolution
      ? push(EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(id, submissionId))
      : afterEvaluationFinishes().then(() => push(SOLUTION_DETAIL_URI_FACTORY(id, submissionId)));
  };

  render = () => {
    const {
      isOpen = false,
      userId,
      note,
      cancel,
      id,
      presubmitEnvironments,
      presubmitVariables,
      presubmitCountLimitOK,
      presubmitSizeLimitOK,
      changeNote,
      canSubmit,
      hasFailed,
      isProcessing,
      isValidating,
      isSending,
      monitor,
      reset,
      showProgress = true,
      solutionFilesLimit = null,
      solutionSizeLimit = null,
      isReferenceSolution = false,
    } = this.props;

    const { selectedEnvironment, entryPoint } = this.state;

    return (
      <div>
        <SubmitSolution
          userId={userId}
          isOpen={isOpen}
          canSubmit={
            canSubmit &&
            Boolean(presubmitEnvironments) &&
            presubmitEnvironments.length > 0 &&
            !this.needsToSelectEntryPoint()
          }
          isValidating={isValidating}
          isSending={isSending}
          hasFailed={hasFailed}
          uploadId={id}
          reset={reset}
          note={note}
          saveNote={changeNote}
          onClose={cancel}
          presubmitEnvironments={presubmitEnvironments}
          presubmitVariables={presubmitVariables}
          presubmitCountLimitOK={presubmitCountLimitOK}
          presubmitSizeLimitOK={presubmitSizeLimitOK}
          solutionFilesLimit={solutionFilesLimit}
          solutionSizeLimit={solutionSizeLimit}
          selectedEnvironment={selectedEnvironment}
          changeRuntimeEnvironment={this.changeRuntimeEnvironment}
          selectedEntryPoint={entryPoint}
          changeEntryPoint={this.changeEntryPoint}
          submitSolution={this.submit}
          onFilesChange={this.presubmit}
          isReferenceSolution={isReferenceSolution}
        />

        {showProgress && (
          <EvaluationProgressContainer
            isOpen={isProcessing && this.isMeTheObserver()}
            monitor={this.isMeTheObserver() ? monitor : null}
            onFinish={this.afterEvaluationFinishes}
          />
        )}
      </div>
    );
  };
}

SubmitSolutionContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  id: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  presubmitValidation: PropTypes.func,
  solutionFilesLimit: PropTypes.number,
  solutionSizeLimit: PropTypes.number,
  userId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  cancel: PropTypes.func.isRequired,
  note: PropTypes.string,
  changeNote: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool,
  hasFailed: PropTypes.bool,
  isProcessing: PropTypes.bool,
  isValidating: PropTypes.bool,
  isSending: PropTypes.bool,
  submissionId: PropTypes.string,
  monitor: PropTypes.object,
  presubmitEnvironments: PropTypes.array,
  presubmitVariables: PropTypes.array,
  presubmitCountLimitOK: PropTypes.bool,
  presubmitSizeLimitOK: PropTypes.bool,
  progressObserverId: PropTypes.string,
  submitSolution: PropTypes.func.isRequired,
  afterEvaluationStarts: PropTypes.func,
  presubmitSolution: PropTypes.func.isRequired,
  uploadedFiles: PropTypes.array,
  removedFiles: PropTypes.array,
  reset: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  showProgress: PropTypes.bool,
  isReferenceSolution: PropTypes.bool,
  afterEvaluationFinishes: PropTypes.func.isRequired,
};

export default withLinks(
  connect(
    (state, { id, userId }) => {
      return {
        userId: userId || loggedInUserIdSelector(state),
        note: getNote(state),
        uploadedFiles: uploadedFilesSelector(state, id),
        removedFiles: removedUploadFilesSelector(state, id),
        isProcessing: isProcessing(state),
        isValidating: isValidating(state),
        isSending: isSending(state),
        hasFailed: hasFailed(state),
        canSubmit: allFilesUploadedSelector(state, id),
        submissionId: getSubmittedSolutionId(state),
        monitor: getMonitorParams(state),
        presubmitEnvironments: getPresubmitEnvironments(state),
        presubmitVariables: getPresubmitVariables(state),
        presubmitCountLimitOK: getPresubmitCountLimitOK(state),
        presubmitSizeLimitOK: getPresubmitSizeLimitOK(state),
        progressObserverId: getProgressObserverId(state),
      };
    },
    (dispatch, { id, userId, onSubmit, afterEvaluationStarts = null, onReset, presubmitValidation }) => ({
      changeNote: note => dispatch(changeNote(note)),
      cancel: () => dispatch(cancel()),
      submitSolution: (note, files, runtimeEnvironmentId = null, entryPoint = null, progressObserverId = null) =>
        dispatch(onSubmit(userId, id, note, files, runtimeEnvironmentId, entryPoint, progressObserverId)).then(
          afterEvaluationStarts
        ),
      presubmitSolution: files => dispatch(presubmitValidation(id, files)),
      reset: () => dispatch(resetUpload(id)) && dispatch(onReset(userId, id)),
      afterEvaluationFinishes: () => Promise.all([dispatch(fetchUsersSolutions(userId, id)), dispatch(canSubmit(id))]),
    })
  )(withRouter(SubmitSolutionContainer))
);
