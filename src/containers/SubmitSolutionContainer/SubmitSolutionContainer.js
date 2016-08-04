import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import SubmitSolution from '../../components/SubmitSolution';
import { SUBMISSION_DETAIL_URI_FACTORY, ASSIGNMENT_DETAIL_URI_FACTORY } from '../../links';
import EvaluationProgressContainer from '../EvaluationProgressContainer';

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

  uploadFiles = (files) =>
    files.map(this.props.uploadFile);

  retryUploadFile = (payload) => {
    this.props.removeFailedFile(payload);
    this.uploadFiles([ payload.file ]);
  };

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
      attachedFiles,
      uploadingFiles,
      failedFiles,
      removedFiles,
      note,
      changeNote,
      removeFailedFile,
      removeFile,
      returnFile,
      isProcessing,
      submissionId,
      submissionDetailLink
    } = this.props;

    return (
      <div>
        <SubmitSolution
          isOpen={isOpen}
          canSubmit={attachedFiles.length > 0 &&
            uploadingFiles.length === 0 &&
            failedFiles.length === 0}
          reset={reset}
          uploadFiles={this.uploadFiles}
          saveNote={changeNote}
          uploadingFiles={uploadingFiles}
          attachedFiles={attachedFiles}
          failedFiles={failedFiles}
          removedFiles={removedFiles}
          removeFailedFile={removeFailedFile}
          removeFile={removeFile}
          returnFile={returnFile}
          retryUploadFile={this.retryUploadFile}
          onClose={onClose}
          submitSolution={this.submit} />

        <EvaluationProgressContainer
          isOpen={isProcessing}
          assignmentId={assignmentId}
          submissionId={submissionId}
          link={submissionDetailLink(submissionId)}
        />
      </div>
    );
  };

}

export default connect(
  state => ({
    userId: state.auth.userId,
    note: state.submission.get('note'),
    uploadingFiles: state.submission.getIn(['files', 'uploading']).toJS(),
    attachedFiles: state.submission.getIn(['files', 'uploaded']).toJS(),
    failedFiles: state.submission.getIn(['files', 'failed']).toJS(),
    removedFiles: state.submission.getIn(['files', 'removed']).toJS(),
    isProcessing: state.submission.get('status') === submissionStatus.PROCESSING,
    submissionId: state.submission.get('submissionId')
  }),
  (dispatch, props) => ({
    changeNote: (note) => dispatch(changeNote(note)),
    uploadFile: (payload) => dispatch(uploadFile(payload)),
    removeFailedFile: (payload) => dispatch(removeFailedFile(payload)),
    removeFile: (payload) => dispatch(removeFile(payload)),
    returnFile: (payload) => dispatch(returnFile(payload)),
    submitSolution: (note, files) => dispatch(submitSolution(props.assignmentId, note, files)),
    submissionDetailLink: (submissionId) => SUBMISSION_DETAIL_URI_FACTORY(props.assignmentId, submissionId)
  })
)(SubmitSolutionContainer);
