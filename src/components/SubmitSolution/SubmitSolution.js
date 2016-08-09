import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock
} from 'react-bootstrap';
import Icon from 'react-fontawesome';
import DropZone from 'react-dropzone';
import UploadsTable from '../UploadsTable';
import styles from './SubmitSolution.scss';

const SubmitSolution = ({
  isOpen,
  onClose,
  reset,
  canSubmit,
  uploadFiles,
  saveNote,
  submitSolution,
  uploadingFiles = [],
  attachedFiles = [],
  failedFiles = [],
  removedFiles = [],
  removeFile,
  returnFile,
  removeFailedFile,
  retryUploadFile
}) => (
  <Modal show={isOpen} backdrop='static' onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>
        <FormattedMessage id='app.submitSolution.title' defaultMessage='Submit your solution' />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <DropZone onDrop={uploadFiles} className={styles.submitSolutionDropZone}>
        <p><FormattedMessage id='app.submitSolution.dragAndDrop' defaultMessage='Drag and drop files here.' /></p>
        <p>
          <Button bsStyle='primary' className='btn-flat'>
            <Icon name='cloud-upload' />{' '}<FormattedMessage id='app.submitSolution.addFile' defaultMessage='Add a file' />
          </Button>
        </p>
      </DropZone>

      {(uploadingFiles.length > 0 || attachedFiles.length > 0 || failedFiles.length > 0 || removedFiles.length > 0) &&
        <UploadsTable
          uploadingFiles={uploadingFiles}
          attachedFiles={attachedFiles}
          failedFiles={failedFiles}
          removedFiles={removedFiles}
          removeFile={removeFile}
          returnFile={returnFile}
          removeFailedFile={removeFailedFile}
          retryUploadFile={retryUploadFile} />}

      <FormGroup>
        <ControlLabel>
          <FormattedMessage id='app.submitSolution.noteLabel' defaultMessage='Note for you and your supervisor(s)' />
        </ControlLabel>
        <FormControl
          onChange={(e) => saveNote(e.target.value)}
          type='text'
          placeholder='Poznámka pro Vás a cvičícího' />
      </FormGroup>
    </Modal.Body>
    <Modal.Footer>
      <Button
        type='submit'
        disabled={!canSubmit}
        bsStyle={canSubmit ? 'success' : 'default'}
        className='btn-flat'
        onClick={submitSolution}>
          <FormattedMessage id='app.submitSolution.submitButton' defaultMessage='Submit your solution' />
      </Button>
      <Button
        bsStyle='default'
        className='btn-flat'
        onClick={reset}>
          <FormattedMessage id='app.submitSolution.resetFormButton' defaultMessage='Reset form' />
      </Button>
      <Button
        bsStyle='default'
        className='btn-flat'
        onClick={onClose}>
          <FormattedMessage id='app.submitSolution.closeButton' defaultMessage='Close' />
      </Button>
      {!canSubmit && (
        <HelpBlock>
          <FormattedMessage
            id='app.submistSolution.instructions'
            defaultMessage='You must attach at least one file with source code and wait, until all your files are uploaded to the server. If there is a problem uploading any of the files, please try uploading it again or remove the file. This form cannot be submitted until there are any files which have not been successfully uploaded or which could not have been uploaded to the server.' />
        </HelpBlock>)}
    </Modal.Footer>
  </Modal>
);

SubmitSolution.propTypes = {
  onClose: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  uploadFiles: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool.isRequired,
  submitSolution: PropTypes.func.isRequired,
  uploadingFiles: PropTypes.array.isRequired,
  attachedFiles: PropTypes.array.isRequired,
  removeFile: PropTypes.func.isRequired,
  retryUploadFile: PropTypes.func.isRequired
};

export default SubmitSolution;
