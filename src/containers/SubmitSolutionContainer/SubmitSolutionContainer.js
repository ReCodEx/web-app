import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

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
  hasEntryPoint,
} from '../../redux/selectors/submission';

import { createGetUploadedFiles, createAllUploaded } from '../../redux/selectors/upload';
import { getProgressObserverId } from '../../redux/selectors/evaluationProgress';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { cancel, changeNote } from '../../redux/modules/submission';
import { reset as resetUpload } from '../../redux/modules/upload';

import withLinks from '../../helpers/withLinks';
import { canSubmit } from '../../redux/modules/canSubmit';

class SubmitSolutionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedEnvironment: null,
      entryPoint: null,
    };
  }

  componentWillReceiveProps({ presubmitEnvironments, attachedFiles }) {
    // Only check the selection, if presubmit environments are set ...
    if (presubmitEnvironments && presubmitEnvironments.length > 0) {
      let newEnv = this.state.selectedEnvironment;
      if (newEnv && !presubmitEnvironments.find(e => e.id === newEnv)) {
        newEnv = null; // selected env is not availabe anymore
      }
      if (!newEnv) {
        newEnv = presubmitEnvironments[0].id;
      }

      if (newEnv !== this.state.selectedEnvironment) {
        this.setState({ selectedEnvironment: newEnv });
      }
    }

    // If entry point is no longer valid ...
    if (this.state.entryPoint && attachedFiles && !attachedFiles.find(f => f.name === this.state.entryPoint)) {
      this.setState({ entryPoint: null });
    }
  }

  getEntryPoint = () => {
    const { attachedFiles, presubmitVariables } = this.props;
    const { selectedEnvironment, entryPoint } = this.state;

    if (!hasEntryPoint(presubmitVariables, selectedEnvironment)) {
      return null;
    }

    const defaultEntryPoint = attachedFiles && attachedFiles.length > 0 && attachedFiles.map(f => f.name).sort()[0];

    return entryPoint || defaultEntryPoint;
  };

  submit = () => {
    const { attachedFiles, note, submitSolution } = this.props;
    const { selectedEnvironment } = this.state;

    submitSolution(
      note,
      attachedFiles.map(item => item.file),
      selectedEnvironment,
      this.getEntryPoint(),
      this.getMyObserverId()
    );
  };

  presubmit = ({ removeFile = null, returnFile = null }) => {
    const { attachedFiles, presubmitSolution } = this.props;
    let files = attachedFiles;
    if (removeFile) {
      files = files.filter(f => f.file !== removeFile.file);
    }
    if (returnFile) {
      files.push(returnFile);
    }
    presubmitSolution(files.map(item => item.file));
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
      push,
      links: { EXERCISE_REFERENCE_SOLUTION_URI_FACTORY, SOLUTION_DETAIL_URI_FACTORY },
    } = this.props;
    return isReferenceSolution
      ? push(EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(id, submissionId))
      : afterEvaluationFinishes(SOLUTION_DETAIL_URI_FACTORY(id, submissionId));
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
      changeNote,
      canSubmit,
      hasFailed,
      isProcessing,
      isValidating,
      isSending,
      monitor,
      reset,
      showProgress = true,
      isReferenceSolution = false,
    } = this.props;

    const { selectedEnvironment, entryPoint } = this.state;

    return (
      <div>
        <SubmitSolution
          userId={userId}
          isOpen={isOpen}
          canSubmit={canSubmit && Boolean(presubmitEnvironments) && presubmitEnvironments.length > 0}
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
  id: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  presubmitValidation: PropTypes.func,
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
  progressObserverId: PropTypes.string,
  submitSolution: PropTypes.func.isRequired,
  presubmitSolution: PropTypes.func.isRequired,
  attachedFiles: PropTypes.array,
  reset: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  showProgress: PropTypes.bool,
  isReferenceSolution: PropTypes.bool,
  afterEvaluationFinishes: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
};

export default withLinks(
  connect(
    (state, { id, userId }) => {
      return {
        userId: userId || loggedInUserIdSelector(state),
        note: getNote(state),
        attachedFiles: createGetUploadedFiles(id)(state),
        isProcessing: isProcessing(state),
        isValidating: isValidating(state),
        isSending: isSending(state),
        hasFailed: hasFailed(state),
        canSubmit: createAllUploaded(id)(state),
        submissionId: getSubmittedSolutionId(state),
        monitor: getMonitorParams(state),
        presubmitEnvironments: getPresubmitEnvironments(state),
        presubmitVariables: getPresubmitVariables(state),
        progressObserverId: getProgressObserverId(state),
      };
    },
    (dispatch, { id, userId, onSubmit, onReset, presubmitValidation }) => ({
      changeNote: note => dispatch(changeNote(note)),
      cancel: () => dispatch(cancel()),
      submitSolution: (note, files, runtimeEnvironmentId = null, entryPoint = null, progressObserverId = null) =>
        dispatch(onSubmit(userId, id, note, files, runtimeEnvironmentId, entryPoint, progressObserverId)),
      presubmitSolution: files => dispatch(presubmitValidation(id, files)),
      reset: () => dispatch(resetUpload(id)) && dispatch(onReset(userId, id)),
      afterEvaluationFinishes: link =>
        Promise.all([dispatch(fetchUsersSolutions(userId, id)), dispatch(canSubmit(id))]).then(() =>
          dispatch(push(link))
        ),
      push: url => dispatch(push(url)),
    })
  )(SubmitSolutionContainer)
);
