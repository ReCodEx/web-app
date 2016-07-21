import React, { PropTypes } from 'react';
import {
  Modal,
  Button,
  Form,
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
  onCancel,
  canSubmit,
  uploadFiles,
  saveNote,
  submitSolution,
  uploadingFiles = [],
  attachedFiles = [],
  failedFiles = [],
  removeFile,
  retryUploadFile
}) => (
    <Form>
      <Modal show={isOpen} onHide={onCancel} backdrop='static'>
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

          {(uploadingFiles.length > 0 || attachedFiles.length > 0 || failedFiles.length > 0) &&
            <UploadsTable
              uploadingFiles={uploadingFiles}
              attachedFiles={attachedFiles}
              failedFiles={failedFiles}
              removeFile={removeFile}
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
            onClick={onCancel}>
              Zrušit
          </Button>
          {!canSubmit &&
            <HelpBlock>Je třeba přiložit alespoň jeden soubor se zdrojovým kódem a počkat, až se nahrají všechny soubory na server.</HelpBlock>}
        </Modal.Footer>
      </Modal>
    </Form>
);

SubmitSolution.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  uploadFiles: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool.isRequired,
  submitSolution: PropTypes.func.isRequired,
  uploadingFiles: PropTypes.array.isRequired,
  attachedFiles: PropTypes.array.isRequired,
  removeFile: PropTypes.func.isRequired,
  retryUploadFile: PropTypes.func.isRequired
};

export default SubmitSolution;
