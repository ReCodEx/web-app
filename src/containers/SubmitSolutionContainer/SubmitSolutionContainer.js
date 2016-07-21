import React, { Component, PropTypes } from 'react';
import SubmitSolution from '../../components/SubmitSolution';

class SubmitSolutionContainer extends Component {

  state = {
    note: '',
    uploadedFiles: [],
    uploadingFiles: [],
    failedFiles: []
  };

  onCancel = () => {
    console.log('cancel');
    this.props.onCancel();
  };

  saveNote = (note) =>
    this.setState({ note });

  uploadFiles = (files) =>
    this.setState({
      uploadingFiles: [
        ...this.state.uploadingFiles,
        ...files.map(this.uploadFile).filter(file => file !== null)
      ]
    });

  uploadFile = (file) => {
    if (this.state.uploadedFiles.find(old => old.name === file.name)
        || this.state.uploadingFiles.find(old => old.name === file.name)) {
      return null;
    }

    // @todo make this a real upload
    setTimeout(() => {
      if (Math.random() > 0.5) {
        this.finishUploadFile(file);
      } else {
        this.failUploadFile(file);
      }
    }, 200 + 1000 * Math.random());

    return file;
  };

  finishUploadFile = (file) =>
    this.setState({
      uploadingFiles: this.state.uploadingFiles.filter(old => old.name != file.name),
      uploadedFiles: [ ...this.state.uploadedFiles, file ]
    });

  failUploadFile = (file) =>
    this.setState({
      uploadingFiles: this.state.uploadingFiles.filter(old => old.name != file.name),
      failedFiles: [ ...this.state.failedFiles, file ]
    });

  removeFile = (name) =>
    this.setState({
      uploadedFiles: this.state.uploadedFiles.filter(file => file.name !== name),
      failedFiles: this.state.failedFiles.filter(file => file.name !== name)
    });

  retryUploadFile = (file) => {
    this.setState({
      failedFiles: this.state.failedFiles.filter(old => old.name !== file.name)
    });
    this.uploadFiles([ file ]);
  };

  submitSolution = () =>
    console.log('submit solution', this.state.note, this.state.uploadedFiles);

  render = () => (
    <SubmitSolution
      canSubmit={this.state.uploadedFiles.length > 0 && this.state.uploadingFiles.length === 0 && this.state.failedFiles.length === 0}
      isOpen={this.props.isOpen}
      uploadFiles={this.uploadFiles}
      saveNote={this.saveNote}
      uploadingFiles={this.state.uploadingFiles}
      attachedFiles={this.state.uploadedFiles}
      failedFiles={this.state.failedFiles}
      removeFile={this.removeFile}
      retryUploadFile={this.retryUploadFile}
      onCancel={this.onCancel}
      submitSolution={this.submitSolution} />
  );

}

SubmitSolutionContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  assignmentId: PropTypes.string.isRequired
};

export default SubmitSolutionContainer;
