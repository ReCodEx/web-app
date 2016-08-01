import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import SubmitSolution from '../../components/SubmitSolution';

import {
  init,
  changeNote,
  uploadFile,
  removeFile,
  returnFile,
  removeFailedFile,
  submitSolution
} from '../../redux/modules/submission';

class SubmitSolutionContainer extends Component {

  componentWillMount = () => this.reset();

  reset = () => {
    const { init, userId, assignmentId } = this.props;
    init(userId, assignmentId);
  };

  close = () => {
    console.log('cancel');
    this.props.onCancel();
  };

  uploadFiles = (files) =>
    files.map(this.props.uploadFile);

  retryUploadFile = (payload) => {
    this.props.removeFailedFile(payload);
    this.uploadFiles([ payload.file ]);
  };

  render = () => {
    const {
      assignmentId,
      attachedFiles,
      uploadingFiles,
      failedFiles,
      removedFiles,
      isOpen,
      note,
      changeNote,
      removeFailedFile,
      removeFile,
      returnFile,
      submitSolution
    } = this.props;

    return (
      <SubmitSolution
        canSubmit={attachedFiles.length > 0
          && uploadingFiles.length === 0
          && failedFiles.length === 0}
        isOpen={isOpen}
        reset={this.reset}
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
        close={this.close}
        submitSolution={() =>
          submitSolution(assignmentId, note, attachedFiles.map(item => item.file))} />
    );
  };

}

SubmitSolutionContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  assignmentId: PropTypes.string.isRequired
};

export default connect(
  state => ({
    userId: state.auth.userId,
    note: state.submission.get('note'),
    uploadingFiles: state.submission.getIn(['files', 'uploading']).toJS(),
    attachedFiles: state.submission.getIn(['files', 'uploaded']).toJS(),
    failedFiles: state.submission.getIn(['files', 'failed']).toJS(),
    removedFiles: state.submission.getIn(['files', 'removed']).toJS(),
  }), {
    init,
    changeNote,
    uploadFile,
    removeFailedFile,
    removeFile,
    returnFile,
    submitSolution
  }
)(SubmitSolutionContainer);
