import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Upload from '../../components/Submissions/Upload';

import {
  getUploadingFiles,
  getUploadedFiles,
  getRemovedFiles,
  getFailedFiles
} from '../../redux/selectors/submission';

import {
  uploadFile,
  removeFile,
  returnFile,
  removeFailedFile
} from '../../redux/modules/submission';

class UploadContainer extends Component {

  uploadFiles = (files) =>
    files.map(this.props.uploadFile);

  retryUploadFile = (payload) => {
    this.props.removeFailedFile(payload);
    this.uploadFiles([ payload.file ]);
  };

  render = () => {
    const {
      attachedFiles,
      uploadingFiles,
      failedFiles,
      removedFiles,
      removeFailedFile,
      removeFile,
      returnFile
    } = this.props;

    return (
      <Upload
        uploadFiles={this.uploadFiles}
        uploadingFiles={uploadingFiles}
        attachedFiles={attachedFiles}
        failedFiles={failedFiles}
        removedFiles={removedFiles}
        removeFailedFile={removeFailedFile}
        removeFile={removeFile}
        returnFile={returnFile}
        retryUploadFile={this.retryUploadFile} />
    );
  };

}

export default connect(
  state => ({
    uploadingFiles: getUploadingFiles(state).toJS(),
    attachedFiles: getUploadedFiles(state).toJS(),
    failedFiles: getFailedFiles(state).toJS(),
    removedFiles: getRemovedFiles(state).toJS()
  }),
  (dispatch, props) => ({
    uploadFile: (payload) => dispatch(uploadFile(payload)),
    removeFailedFile: (payload) => dispatch(removeFailedFile(payload)),
    removeFile: (payload) => dispatch(removeFile(payload)),
    returnFile: (payload) => dispatch(returnFile(payload))
  })
)(UploadContainer);
