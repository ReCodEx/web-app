import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { connect } from 'react-redux';
import SubmitSolution from '../../components/Submissions/SubmitSolution';
import EvaluationProgressContainer from '../EvaluationProgressContainer';

import {
  getNote,
  isProcessing,
  isSending,
  hasFailed,
  getSubmissionId,
  getMonitorParams
} from '../../redux/selectors/submission';

import {
  createGetUploadedFiles,
  createAllUploaded
} from '../../redux/selectors/upload';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { cancel, changeNote } from '../../redux/modules/submission';
import { reset as resetUpload } from '../../redux/modules/upload';

import withLinks from '../../hoc/withLinks';

class SubmitSolutionContainer extends Component {
  state = {
    runtimeEnvrionment: null
  };

  submit = () => {
    const {
      attachedFiles,
      note,
      submitSolution
    } = this.props;

    const { runtimeEnvironment } = this.state;

    submitSolution(
      note,
      attachedFiles.map(item => item.file),
      runtimeEnvironment
    );
  };

  changeRuntimeEnvironment = runtimeEnvironment => {
    this.setState({ runtimeEnvironment });
  };

  render = () => {
    const {
      isOpen = false,
      userId,
      note,
      cancel,
      id,
      runtimeEnvironmentIds,
      changeNote,
      canSubmit,
      hasFailed,
      isProcessing,
      isSending,
      submissionId,
      monitor,
      reset,
      links: { SUBMISSION_DETAIL_URI_FACTORY }
    } = this.props;

    return (
      <div>
        <SubmitSolution
          userId={userId}
          isOpen={isOpen}
          canSubmit={canSubmit}
          isSending={isSending}
          hasFailed={hasFailed}
          uploadId={id}
          reset={reset}
          note={note}
          saveNote={changeNote}
          onClose={cancel}
          runtimeEnvironmentIds={runtimeEnvironmentIds}
          changeRuntimeEnvironment={this.changeRuntimeEnvironment}
          submitSolution={this.submit}
        />

        <EvaluationProgressContainer
          isOpen={isProcessing}
          monitor={monitor}
          link={SUBMISSION_DETAIL_URI_FACTORY(id, submissionId)}
        />
      </div>
    );
  };
}

SubmitSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  userId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  cancel: PropTypes.func.isRequired,
  note: PropTypes.string,
  changeNote: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool,
  hasFailed: PropTypes.bool,
  isProcessing: PropTypes.bool,
  isSending: PropTypes.bool,
  submissionId: PropTypes.string,
  monitor: PropTypes.object,
  submitSolution: PropTypes.func.isRequired,
  attachedFiles: PropTypes.array,
  reset: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  runtimeEnvironmentIds: PropTypes.array
};

export default withLinks(
  connect(
    (state, { id, userId }) => {
      const getUploadedFiles = createGetUploadedFiles(id);
      const allUploaded = createAllUploaded(id);
      return {
        userId: userId || loggedInUserIdSelector(state),
        note: getNote(state),
        attachedFiles: (getUploadedFiles(state) || List()).toJS(),
        isProcessing: isProcessing(state),
        isSending: isSending(state),
        hasFailed: hasFailed(state),
        canSubmit: allUploaded(state) || false,
        submissionId: getSubmissionId(state),
        monitor: getMonitorParams(state)
      };
    },
    (dispatch, { id, userId, onSubmit, onReset }) => ({
      changeNote: note => dispatch(changeNote(note)),
      cancel: () => dispatch(cancel()),
      submitSolution: (note, files, runtimeEnvironmentId = null) =>
        dispatch(onSubmit(userId, id, note, files, runtimeEnvironmentId)),
      reset: () => dispatch(resetUpload(id)) && dispatch(onReset(userId, id))
    })
  )(SubmitSolutionContainer)
);
