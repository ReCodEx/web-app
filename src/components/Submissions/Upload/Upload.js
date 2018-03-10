import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DropZone from 'react-dropzone';
import Button from '../../widgets/FlatButton';
import UploadsTable from '../UploadsTable';
import { UploadIcon } from '../../icons';

const dropZoneStyles = {
  borderWidth: 2,
  borderColor: '#666',
  borderStyle: 'dashed',
  padding: 40,
  marginBottom: 20,
  borderRadius: 5,
  fontSize: 20,
  textAlign: 'center'
};

const Upload = ({
  uploadFiles,
  uploadingFiles,
  attachedFiles,
  failedFiles,
  removedFiles,
  removeFile,
  returnFile,
  removeFailedFile,
  retryUploadFile
}) =>
  <div>
    <DropZone onDrop={uploadFiles} style={dropZoneStyles}>
      <p>
        <FormattedMessage
          id="app.submitSolution.dragAndDrop"
          defaultMessage="Drag and drop files here."
        />
      </p>
      <p>
        <Button bsStyle="primary">
          <UploadIcon />{' '}
          <FormattedMessage
            id="app.submitSolution.addFile"
            defaultMessage="Add File(s)"
          />
        </Button>
      </p>
    </DropZone>

    {(uploadingFiles.length > 0 ||
      attachedFiles.length > 0 ||
      failedFiles.length > 0 ||
      removedFiles.length > 0) &&
      <UploadsTable
        uploadingFiles={uploadingFiles}
        attachedFiles={attachedFiles}
        failedFiles={failedFiles}
        removedFiles={removedFiles}
        removeFile={removeFile}
        returnFile={returnFile}
        removeFailedFile={removeFailedFile}
        retryUploadFile={retryUploadFile}
      />}
  </div>;

Upload.propTypes = {
  uploadingFiles: PropTypes.array.isRequired,
  attachedFiles: PropTypes.array.isRequired,
  failedFiles: PropTypes.array.isRequired,
  removedFiles: PropTypes.array.isRequired,
  uploadFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  returnFile: PropTypes.func.isRequired,
  removeFailedFile: PropTypes.func.isRequired,
  retryUploadFile: PropTypes.func.isRequired
};

export default Upload;
