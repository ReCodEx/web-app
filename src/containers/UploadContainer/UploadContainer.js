import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Upload from '../../components/Solutions/Upload';

import {
  uploadingFilesSelector,
  uploadedFilesSelector,
  removedUploadFilesSelector,
  failedUploadFilesSelector,
  isUploadCanceledByRequest,
} from '../../redux/selectors/upload.js';

import {
  init,
  startUploadFile,
  uploadFileChunk,
  completeUploadFile,
  cancelUploadFile,
  requestUploadCancel,
  removeFile,
  restoreRemovedFile,
  removeFailedFile,
  manuallyFailUpload,
  finalizeUpload,
  fetchUploadFileDigest,
} from '../../redux/modules/upload.js';

class UploadContainer extends Component {
  componentDidMount() {
    this.props.init();
  }

  retryUploadFile = file => {
    const { removeFailedFile, onChange } = this.props;
    removeFailedFile(file.name);
    const promise = this.uploadFile(file);
    return onChange ? promise.then(onChange) : promise;
  };

  /**
   * The main uploading algorithm. Function is implemented as async, so it can use await to better coordinate API calls.
   * @param {File} file to be uploaded
   */
  uploadFile = async file => {
    const {
      startUploadFile,
      uploadFileChunk,
      completeUploadFile,
      cancelUploadFile,
      finalizeUpload,
      manuallyFailUpload,
      fetchUploadFileDigest,
    } = this.props;

    try {
      const startUploadResult = await startUploadFile(file);
      let partialFile = startUploadResult && startUploadResult.value;
      if (!partialFile || !partialFile.id) {
        manuallyFailUpload(file, 'Invalid response from the server when starting the upload.');
        return null;
      }
      const partialFileId = partialFile.id; // better save the ID, in case of an error

      // boundaries of chunk size, which is adaptively changed during upload
      const minChunkSize = 4096;
      const maxChunkSize = minChunkSize * 1024;
      let chunkSize = 65536;

      while (partialFile.uploadedSize < partialFile.totalSize) {
        if (this.props.isUploadCanceledByRequest(file.name)) {
          await cancelUploadFile(partialFileId, file);
          return null;
        }

        const uploadSize = Math.min(chunkSize, partialFile.totalSize - partialFile.uploadedSize);

        const startTime = Date.now();
        const chunkUploadResult = await uploadFileChunk(partialFile.id, file, partialFile.uploadedSize, uploadSize);
        const endTime = Date.now();

        partialFile = chunkUploadResult.value;
        if (!partialFile || partialFile.id !== partialFileId) {
          cancelUploadFile(partialFileId, file, 'Invalid response from the server when uploading a data chunk.');
          return null;
        }

        // adjusting chunk size based on how long did it take to upload the last chunk
        const elapsedTime = endTime - startTime;
        if (elapsedTime < 2000 && chunkSize < maxChunkSize) {
          chunkSize *= 2;
        } else if (elapsedTime > 4000 && chunkSize > minChunkSize) {
          chunkSize /= 2;
        }
      }

      // complete and consolidate the chunks
      const completionResult = await completeUploadFile(partialFileId, file);
      const uploadedFile = completionResult && completionResult.value;
      if (!uploadedFile) {
        cancelUploadFile(partialFileId, file, 'Invalid response from the server when completing the upload.');
      }

      // verify checksum
      const digestResult = await fetchUploadFileDigest(uploadedFile.id);
      if (!digestResult || !digestResult.value) {
        manuallyFailUpload(file, 'Unable to retrieve file checksum from the server.');
        return null;
      }

      const { algorithm, digest } = digestResult.value;
      if (algorithm === 'sha1') {
        const buffer = await file.arrayBuffer();
        const localDigestBuffer = await window.crypto.subtle.digest('SHA-1', buffer);
        const localDigest = Array.from(new Uint8Array(localDigestBuffer))
          .map(b => b.toString(16).padStart(2, '0')) // translate bytes to hex codes (padded to 2 chars)
          .join('');

        if (digest !== localDigest) {
          manuallyFailUpload(
            file,
            'The file checksum was not verified. The file may have been mutilated during the upload.'
          );
          return null;
        }
      }

      finalizeUpload(file);
      return uploadedFile;
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }
  };

  uploadFiles = files => {
    const promise = Promise.all(files.map(this.uploadFile));
    return this.props.onChange ? promise.then(this.props.onChange) : promise;
  };

  render = () => {
    const {
      existingFiles,
      uploadedFiles,
      uploadingFiles,
      failedFiles,
      removedFiles,
      requestUploadCancel,
      removeFailedFile,
      removeFile,
      restoreRemovedFile,
    } = this.props;

    return (
      <Upload
        existingFiles={existingFiles}
        uploadingFiles={uploadingFiles}
        uploadedFiles={uploadedFiles}
        failedFiles={failedFiles}
        removedFiles={removedFiles}
        doUploadFiles={this.uploadFiles}
        doRequestUploadCancel={requestUploadCancel}
        doRemoveFailedFile={removeFailedFile}
        doRemoveFile={removeFile}
        doRestoreRemovedFile={restoreRemovedFile}
        doRetryUploadFile={this.retryUploadFile}
      />
    );
  };
}

UploadContainer.propTypes = {
  id: PropTypes.string.isRequired,
  existingFiles: PropTypes.instanceOf(Set),
  onChange: PropTypes.func,
  init: PropTypes.func.isRequired,
  uploadedFiles: PropTypes.array,
  uploadingFiles: PropTypes.array,
  failedFiles: PropTypes.array,
  removedFiles: PropTypes.array,
  isUploadCanceledByRequest: PropTypes.func.isRequired,
  startUploadFile: PropTypes.func.isRequired,
  uploadFileChunk: PropTypes.func.isRequired,
  completeUploadFile: PropTypes.func.isRequired,
  cancelUploadFile: PropTypes.func.isRequired,
  finalizeUpload: PropTypes.func.isRequired,
  manuallyFailUpload: PropTypes.func.isRequired,
  fetchUploadFileDigest: PropTypes.func.isRequired,
  requestUploadCancel: PropTypes.func.isRequired,
  removeFailedFile: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  restoreRemovedFile: PropTypes.func.isRequired,
};

export default connect(
  (state, { id }) => ({
    uploadingFiles: uploadingFilesSelector(state, id),
    uploadedFiles: uploadedFilesSelector(state, id),
    failedFiles: failedUploadFilesSelector(state, id),
    removedFiles: removedUploadFilesSelector(state, id),
    isUploadCanceledByRequest: isUploadCanceledByRequest(state, id),
  }),
  (dispatch, { id, onChange }) => ({
    init: () => dispatch(init(id)),
    // per-partes upload
    startUploadFile: file => dispatch(startUploadFile(id, file)),
    uploadFileChunk: (partialFileId, file, offset, size) =>
      dispatch(uploadFileChunk(id, partialFileId, file, offset, size)),
    completeUploadFile: (partialFileId, file) => dispatch(completeUploadFile(id, partialFileId, file)),
    cancelUploadFile: (partialFileId, file, failWithError = null) =>
      dispatch(cancelUploadFile(id, partialFileId, file, failWithError)),
    // user interaction
    requestUploadCancel: fileName => dispatch(requestUploadCancel(id, fileName)),
    removeFailedFile: fileName => dispatch(removeFailedFile(id, fileName)),
    removeFile: fileName => {
      dispatch(removeFile(id, fileName));
      onChange && onChange({ removeFile: fileName });
    },
    restoreRemovedFile: fileName => {
      dispatch(restoreRemovedFile(id, fileName));
      onChange && onChange({ restoreFile: fileName });
    },
    finalizeUpload: file => dispatch(finalizeUpload(id, file)),
    manuallyFailUpload: (file, message = '') => dispatch(manuallyFailUpload(id, file, message)),
    fetchUploadFileDigest: id => dispatch(fetchUploadFileDigest(id)),
  })
)(UploadContainer);
