import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import Upload from '../../components/Submissions/Upload';

import {
  createGetUploadingFiles,
  createGetUploadedFiles,
  createGetRemovedFiles,
  createGetFailedFiles
} from '../../redux/selectors/upload';

import {
  init,
  uploadFile,
  removeFile,
  returnFile,
  removeFailedFile
} from '../../redux/modules/upload';

class UploadContainer extends Component {

  componentWillMount() {
    this.props.init();
  }

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

UploadContainer.propTypes = {
  id: PropTypes.string.isRequired,
  init: PropTypes.func.isRequired,
  attachedFiles: PropTypes.array,
  uploadingFiles: PropTypes.array,
  failedFiles: PropTypes.array,
  removedFiles: PropTypes.array,
  removeFailedFile: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  returnFile: PropTypes.func.isRequired,
  uploadFile: PropTypes.func.isRequired
};

export default connect(
  (state, { id }) => ({
    uploadingFiles: (createGetUploadingFiles(id)(state) || List()).toJS(),
    attachedFiles: (createGetUploadedFiles(id)(state) || List()).toJS(),
    failedFiles: (createGetFailedFiles(id)(state) || List()).toJS(),
    removedFiles: (createGetRemovedFiles(id)(state) || List()).toJS()
  }),
  (dispatch, { id }) => ({
    init: () => dispatch(init(id)),
    uploadFile: (payload) => dispatch(uploadFile(id, payload)),
    removeFailedFile: (payload) => dispatch(removeFailedFile(id, payload)),
    removeFile: (payload) => dispatch(removeFile(id, payload)),
    returnFile: (payload) => dispatch(returnFile(id, payload))
  })
)(UploadContainer);
