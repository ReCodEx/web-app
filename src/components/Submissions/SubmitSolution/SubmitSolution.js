import React, { PropTypes } from 'react';
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from 'react-intl';
import {
  Modal,
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock
} from 'react-bootstrap';
import {
  LoadingIcon,
  WarningIcon,
  SendIcon,
  DeleteIcon,
  CloseIcon
} from '../../Icons';
import UploadContainer from '../../../containers/UploadContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const messages = defineMessages({
  detectRte: {
    id: 'app.submitSolution.autodetect',
    defaultMessage: 'Automatically detect'
  }
});

const SubmitSolution = (
  {
    userId,
    isOpen,
    onClose,
    reset,
    uploadId,
    canSubmit,
    isSending,
    hasFailed,
    note = '',
    runtimeEnvironmentIds,
    changeRuntimeEnvironment,
    saveNote,
    submitSolution,
    intl: { formatMessage }
  }
) => (
  <Modal show={isOpen} backdrop="static" onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>
        <FormattedMessage
          id="app.submitSolution.title"
          defaultMessage="Submit the solution"
        />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>
        <UsersNameContainer userId={userId} />
      </p>
      <UploadContainer id={uploadId} />

      {runtimeEnvironmentIds.length > 0 &&
        <FormGroup>
          <ControlLabel>
            <FormattedMessage
              id="app.submitSolution.runtimeEnvironment"
              defaultMessage="Select programming language/tool type/runtime environemnt:"
            />
          </ControlLabel>
          <FormControl
            onChange={e => changeRuntimeEnvironment(e.target.value)}
            componentClass="select"
            defaultValue={null}
          >
            <option value={null}>
              {formatMessage(messages.detectRte)}
            </option>
            {runtimeEnvironmentIds.map(rte => (
              <option key={rte} value={rte}>{rte}</option>
            ))}
          </FormControl>
        </FormGroup>}

      <FormGroup>
        <ControlLabel>
          <FormattedMessage
            id="app.submitSolution.noteLabel"
            defaultMessage="Short description (optional):"
          />
        </ControlLabel>
        <FormControl
          onChange={e => saveNote(e.target.value)}
          value={note}
          type="text"
        />
      </FormGroup>

      {hasFailed &&
        <p className="text-left callout callout-danger">
          <FormattedMessage
            id="app.submistSolution.submitFailed"
            defaultMessage="Submission was rejected by the server. This usually means you have uploaded incorrect files - do your files have proper file type extensions? If you cannot submit the solution and there is no obvious reason, contact your supervisor to sort things out."
          />
        </p>}
    </Modal.Body>
    <Modal.Footer>
      {isSending &&
        <Button
          type="submit"
          disabled={true}
          bsStyle="success"
          className="btn-flat"
        >
          <LoadingIcon />
          {' '}
          <FormattedMessage
            id="app.submitSolution.submittingButtonText"
            defaultMessage="Submitting the solution ..."
          />
        </Button>}

      {!isSending &&
        <Button
          type="submit"
          disabled={!canSubmit}
          bsStyle={hasFailed ? 'danger' : canSubmit ? 'success' : 'default'}
          className="btn-flat"
          onClick={submitSolution}
        >
          {hasFailed ? <WarningIcon /> : <SendIcon />}
          {' '}
          <FormattedMessage
            id="app.submitSolution.submitButton"
            defaultMessage="Submit the solution"
          />
        </Button>}

      <Button bsStyle="default" className="btn-flat" onClick={reset}>
        <DeleteIcon />
        {' '}
        <FormattedMessage
          id="app.submitSolution.resetFormButton"
          defaultMessage="Reset form"
        />
      </Button>

      <Button bsStyle="default" className="btn-flat" onClick={onClose}>
        <CloseIcon />
        {' '}
        <FormattedMessage
          id="app.submitSolution.closeButton"
          defaultMessage="Close"
        />
      </Button>

      {!canSubmit &&
        <HelpBlock className="text-left">
          <FormattedMessage
            id="app.submistSolution.instructions"
            defaultMessage="You must attach at least one file with source code and wait, until all your files are uploaded to the server. If there is a problem uploading any of the files, please try uploading it again or remove the file. This form cannot be submitted until there are any files which have not been successfully uploaded or which could not have been uploaded to the server."
          />
        </HelpBlock>}
    </Modal.Footer>
  </Modal>
);

SubmitSolution.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  uploadId: PropTypes.string.isRequired,
  canSubmit: PropTypes.bool.isRequired,
  submitSolution: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  note: PropTypes.string,
  saveNote: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool,
  isProcessing: PropTypes.bool,
  isSending: PropTypes.bool,
  runtimeEnvironmentIds: PropTypes.array,
  changeRuntimeEnvironment: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(SubmitSolution);
