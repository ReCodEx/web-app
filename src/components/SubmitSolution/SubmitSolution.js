import React, { PropTypes } from 'react';
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

const SubmitSolution = ({
  isOpen,
  close,
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
  reset,
  retryUploadFile
}) => (
    <Modal show={isOpen} onHide={close} backdrop='static'>
      <Modal.Header hideButton>
        <Modal.Title>Odevzdat nové řešení</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DropZone
          onDrop={uploadFiles}
          style={{
            minHeight: 200,
            borderWidth: 2,
            borderColor: '#666',
            borderStyle: 'dashed',
            padding: 20,
            margin: 20,
            borderRadius: 5
          }}>
          <p style={{ padding: 20, fontSize: 20 }}>Sem přetáhněte soubory s řešením.</p>
        </DropZone>
        <HelpBlock>Místo přetahování je možné kliknout na box a vybrat soubory klasicky.</HelpBlock>

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
          <ControlLabel>Poznámka k řešení</ControlLabel>
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
            Odevzdat
        </Button>
        <Button
          bsStyle='default'
          className='btn-flat'
          onClick={reset}>
            Resetovat formulář
        </Button>
        <Button
          bsStyle='default'
          className='btn-flat'
          onClick={close}>
            Zavřít okno
        </Button>
        {!canSubmit &&
          <HelpBlock>Je třeba přiložit alespoň jeden soubor se zdrojovým kódem a počkat, až se nahrají všechny soubory na server. Pokud se nepodaří některý ze souborů nahrát na server, zkuste prosím soubor nahrát znovu nebo takový soubor smažte. Formulář není možné odeslat, dokud v něm je alespoň jeden soubor, který se nepodařilo na hrát na server.</HelpBlock>}
      </Modal.Footer>
    </Modal>
);

SubmitSolution.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
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
