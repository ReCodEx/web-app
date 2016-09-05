import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import SubmitSolution from '../../components/Submissions/SubmitSolution';
import EvaluationProgressContainer from '../EvaluationProgressContainer';

import {
  getNote,
  getUploadingFiles,
  getUploadedFiles,
  getRemovedFiles,
  getFailedFiles,
  isProcessing,
  isSubmitting,
  isSending,
  hasFailed,
  canSubmit,
  getSubmissionId,
  getMonitorParams
} from '../../redux/selectors/submission';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';

import {
  submissionStatus,
  changeNote,
  uploadFile,
  removeFile,
  returnFile,
  removeFailedFile,
  submitSolution
} from '../../redux/modules/submission';

class SubmitSolutionContainer extends Component {

  submit = () => {
    const {
      attachedFiles,
      onSubmit,
      note,
      submitSolution
    } = this.props;

    submitSolution(note, attachedFiles.map(item => item.file));
    !!onSubmit && onSubmit();
  };

  render = () => {
    const {
      isOpen,
      onClose,
      reset,
      assignmentId,
      note,
      changeNote,
      canSubmit,
      hasFailed,
      isProcessing,
      isSending,
      submissionId,
      monitor
    } = this.props;

    const {
      links: { SUBMISSION_DETAIL_URI_FACTORY, ASSIGNMENT_DETAIL_URI_FACTORY }
    } = this.context;

    return (
      <div>
        <SubmitSolution
          isOpen={isOpen}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          isSending={isSending}
          hasFailed={hasFailed}
          reset={reset}
          saveNote={changeNote}
          onClose={onClose}
          submitSolution={this.submit} />

        <EvaluationProgressContainer
          isOpen={isProcessing}
          monitor={monitor}
          link={SUBMISSION_DETAIL_URI_FACTORY(assignmentId, submissionId)}
        />
      </div>
    );
  };

}

SubmitSolutionContainer.contextTypes = {
  links: PropTypes.object
};

export default connect(
  state => ({
    userId: loggedInUserIdSelector(state),
    note: getNote(state),
    attachedFiles: getUploadedFiles(state).toJS(),
    isProcessing: isProcessing(state),
    isSubmitting: isSubmitting(state),
    isSending: isSending(state),
    hasFailed: hasFailed(state),
    canSubmit: canSubmit(state),
    submissionId: getSubmissionId(state),
    monitor: getMonitorParams(state)
  }),
  (dispatch, props) => ({
    changeNote: (note) => dispatch(changeNote(note)),
    submitSolution: (note, files) => dispatch(submitSolution(props.assignmentId, note, files))
  })
)(SubmitSolutionContainer);
