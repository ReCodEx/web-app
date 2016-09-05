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
import { LoadingIcon, WarningIcon, SendIcon } from '../../Icons';
import UploadContainer from '../../../containers/UploadContainer';

const SubmitSolution = ({
  isOpen,
  onClose,
  reset,
  canSubmit,
  isSubmitting,
  isSending,
  hasFailed,
  saveNote,
  submitSolution
}) => (
  <Modal show={isOpen} backdrop='static' onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>
        <FormattedMessage id='app.submitSolution.title' defaultMessage='Submit your solution' />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <UploadContainer />

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
      {isSending && (
        <Button
          type='submit'
          disabled={true}
          bsStyle='success'
          className='btn-flat'>
            <LoadingIcon /> <FormattedMessage id='app.submitSolution.submittingButtonText' defaultMessage='Submitting your solution ...' />
        </Button>
      )}

      {!isSending && (
        <Button
          type='submit'
          disabled={!canSubmit}
          bsStyle={hasFailed ? 'danger' : canSubmit ? 'success' : 'default'}
          className='btn-flat'
          onClick={submitSolution}>
            {hasFailed ? <WarningIcon /> : <SendIcon />} <FormattedMessage id='app.submitSolution.submitButton' defaultMessage='Submit your solution' />
        </Button>
      )}

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
  canSubmit: PropTypes.bool.isRequired,
  submitSolution: PropTypes.func.isRequired
};

export default SubmitSolution;
