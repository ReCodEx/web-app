import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SubmitSolution from '../../components/Submissions/SubmitSolution';
import EvaluationProgressContainer from '../EvaluationProgressContainer';
import { fetchUsersSubmissions } from '../../redux/modules/submissions';
import {
  getNote,
  isProcessing,
  isSending,
  isValidating,
  hasFailed,
  getSubmissionId,
  getMonitorParams,
  getPresubmitEnvironments
} from '../../redux/selectors/submission';

import {
  createGetUploadedFiles,
  createAllUploaded
} from '../../redux/selectors/upload';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { cancel, changeNote } from '../../redux/modules/submission';
import { reset as resetUpload } from '../../redux/modules/upload';

import withLinks from '../../helpers/withLinks';
import { canSubmit } from '../../redux/modules/canSubmit';

class SubmitSolutionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedEnvironment: null
    };
  }

  componentWillReceiveProps({ presubmitEnvironments }) {
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
  }

  submit = () => {
    const { attachedFiles, note, submitSolution } = this.props;

    const { selectedEnvironment } = this.state;

    submitSolution(
      note,
      attachedFiles.map(item => item.file),
      selectedEnvironment
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

  render = () => {
    const {
      isOpen = false,
      userId,
      note,
      cancel,
      id,
      presubmitEnvironments,
      changeNote,
      canSubmit,
      hasFailed,
      isProcessing,
      isValidating,
      isSending,
      submissionId,
      monitor,
      reset,
      links: {
        EXERCISE_REFERENCE_SOLUTION_URI_FACTORY,
        SUBMISSION_DETAIL_URI_FACTORY
      },
      showProgress = true,
      isReferenceSolution = false,
      onEndFetch
    } = this.props;

    const { selectedEnvironment } = this.state;

    return (
      <div>
        <SubmitSolution
          userId={userId}
          isOpen={isOpen}
          canSubmit={
            canSubmit &&
            Boolean(presubmitEnvironments) &&
            presubmitEnvironments.length > 0
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
          selectedEnvironment={selectedEnvironment}
          changeRuntimeEnvironment={this.changeRuntimeEnvironment}
          submitSolution={this.submit}
          onFilesChange={this.presubmit}
          isReferenceSolution={isReferenceSolution}
        />

        {showProgress &&
          <EvaluationProgressContainer
            isOpen={isProcessing}
            monitor={monitor}
            link={
              isReferenceSolution
                ? EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(id, submissionId)
                : SUBMISSION_DETAIL_URI_FACTORY(id, submissionId)
            }
            onUserClose={!isReferenceSolution ? onEndFetch : null}
            onFinish={!isReferenceSolution ? onEndFetch : null}
          />}
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
  submitSolution: PropTypes.func.isRequired,
  presubmitSolution: PropTypes.func.isRequired,
  attachedFiles: PropTypes.array,
  reset: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  showProgress: PropTypes.bool,
  isReferenceSolution: PropTypes.bool,
  onEndFetch: PropTypes.func.isRequired
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
        submissionId: getSubmissionId(state),
        monitor: getMonitorParams(state),
        presubmitEnvironments: getPresubmitEnvironments(state)
      };
    },
    (dispatch, { id, userId, onSubmit, onReset, presubmitValidation }) => ({
      changeNote: note => dispatch(changeNote(note)),
      cancel: () => dispatch(cancel()),
      submitSolution: (note, files, runtimeEnvironmentId = null) =>
        dispatch(onSubmit(userId, id, note, files, runtimeEnvironmentId)),
      presubmitSolution: files => dispatch(presubmitValidation(id, files)),
      reset: () => dispatch(resetUpload(id)) && dispatch(onReset(userId, id)),
      onEndFetch: () =>
        Promise.all([
          dispatch(fetchUsersSubmissions(userId, id)),
          dispatch(canSubmit(id))
        ])
    })
  )(SubmitSolutionContainer)
);
