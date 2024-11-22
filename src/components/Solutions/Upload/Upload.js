import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dropzone from 'react-dropzone';
import Button from '../../widgets/TheButton';
import UploadsTable from '../UploadsTable';
import { UploadIcon } from '../../icons';

const dropZoneStyles = {
  borderWidth: 2,
  borderColor: '#666',
  borderStyle: 'dashed',
  padding: '0.5em',
  marginBottom: '0.5em',
  borderRadius: '5px',
  textAlign: 'center',
};

const Upload = ({
  existingFiles,
  uploadingFiles,
  uploadedFiles,
  failedFiles,
  removedFiles,
  doUploadFiles,
  doRequestUploadCancel,
  doRemoveFile,
  doRestoreRemovedFile,
  doRemoveFailedFile,
  doRetryUploadFile,
}) => (
  <div>
    <Dropzone onDrop={doUploadFiles}>
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()} style={dropZoneStyles}>
          <input {...getInputProps()} />
          <div className="mt-4">
            <Button variant="primary">
              <UploadIcon gapRight />
              <FormattedMessage id="app.uploadFiles.addFileButton" defaultMessage="Select File(s) for Upload" />
            </Button>
          </div>
          <div className="small text-body-secondary my-3">
            <FormattedMessage id="app.uploadFiles.dragAndDrop" defaultMessage="Or simply drag and drop files here..." />
          </div>
        </div>
      )}
    </Dropzone>

    {(uploadingFiles.length > 0 || uploadedFiles.length > 0 || failedFiles.length > 0 || removedFiles.length > 0) && (
      <UploadsTable
        existingFiles={existingFiles}
        uploadingFiles={uploadingFiles}
        uploadedFiles={uploadedFiles}
        failedFiles={failedFiles}
        removedFiles={removedFiles}
        doRequestUploadCancel={doRequestUploadCancel}
        doRemoveFile={doRemoveFile}
        doRestoreRemovedFile={doRestoreRemovedFile}
        doRemoveFailedFile={doRemoveFailedFile}
        doRetryUploadFile={doRetryUploadFile}
      />
    )}
  </div>
);

Upload.propTypes = {
  existingFiles: PropTypes.instanceOf(Set),
  uploadingFiles: PropTypes.array.isRequired,
  uploadedFiles: PropTypes.array.isRequired,
  failedFiles: PropTypes.array.isRequired,
  removedFiles: PropTypes.array.isRequired,
  doRequestUploadCancel: PropTypes.func.isRequired,
  doUploadFiles: PropTypes.func.isRequired,
  doRemoveFile: PropTypes.func.isRequired,
  doRestoreRemovedFile: PropTypes.func.isRequired,
  doRemoveFailedFile: PropTypes.func.isRequired,
  doRetryUploadFile: PropTypes.func.isRequired,
};

export default Upload;
