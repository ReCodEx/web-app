import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Upload from '../../components/Solutions/Upload';

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

  retryUploadFile = payload => {
    this.props.removeFailedFile(payload);
    this.props.uploadFiles([payload.file]);
  };

  render = () => {
    const {
      uploadFiles,
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
        uploadFiles={uploadFiles}
        uploadingFiles={uploadingFiles}
        attachedFiles={attachedFiles}
        failedFiles={failedFiles}
        removedFiles={removedFiles}
        removeFailedFile={removeFailedFile}
        removeFile={removeFile}
        returnFile={returnFile}
        retryUploadFile={this.retryUploadFile}
      />
    );
  };
}

UploadContainer.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  init: PropTypes.func.isRequired,
  attachedFiles: PropTypes.array,
  uploadingFiles: PropTypes.array,
  failedFiles: PropTypes.array,
  removedFiles: PropTypes.array,
  removeFailedFile: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  returnFile: PropTypes.func.isRequired,
  uploadFile: PropTypes.func.isRequired,
  uploadFiles: PropTypes.func.isRequired
};

const appendThen = (promise, action) => {
  return action ? promise.then(action) : promise;
};

export default connect(
  (state, { id }) => ({
    uploadingFiles: createGetUploadingFiles(id)(state),
    attachedFiles: createGetUploadedFiles(id)(state),
    failedFiles: createGetFailedFiles(id)(state),
    removedFiles: createGetRemovedFiles(id)(state)
  }),
  (dispatch, { id, onChange }) => ({
    init: () => dispatch(init(id)),
    uploadFile: payload =>
      appendThen(dispatch(uploadFile(id, payload)), onChange),
    uploadFiles: files =>
      appendThen(
        Promise.all(files.map(file => dispatch(uploadFile(id, file)))),
        onChange
      ),
    removeFailedFile: payload => dispatch(removeFailedFile(id, payload)),
    removeFile: payload => {
      dispatch(removeFile(id, payload));
      onChange({ removeFile: payload });
    },
    returnFile: payload => {
      dispatch(returnFile(id, payload));
      onChange({ returnFile: payload });
    }
  })
)(UploadContainer);
