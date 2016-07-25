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

  render = () => (
    <SubmitSolution
      canSubmit={this.props.attachedFiles.length > 0
        && this.props.uploadingFiles.length === 0
        && this.props.failedFiles.length === 0}
      isOpen={this.props.isOpen}
      reset={this.reset}
      uploadFiles={this.uploadFiles}
      saveNote={this.props.changeNote}
      uploadingFiles={this.props.uploadingFiles}
      attachedFiles={this.props.attachedFiles}
      failedFiles={this.props.failedFiles}
      removedFiles={this.props.removedFiles}
      removeFailedFile={this.props.removeFailedFile}
      removeFile={this.props.removeFile}
      returnFile={this.props.returnFile}
      retryUploadFile={this.retryUploadFile}
      close={this.close}
      submitSolution={this.props.submitSolution} />
  );

}

SubmitSolutionContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  assignmentId: PropTypes.string.isRequired
};

export default connect(
  state => ({
    userId: state.auth.user.id,
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
