import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
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
} from '../../icons';
import UploadContainer from '../../../containers/UploadContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const commonMessages = defineMessages({
  runtimeEnvironment: {
    id: 'app.submitSolution.runtimeEnvironment',
    defaultMessage: 'Select programming language/tool type/runtime environemnt:'
  },
  detectRte: {
    id: 'app.submitSolution.autodetect',
    defaultMessage: 'Automatically detect'
  },
  selectOneRte: {
    id: 'app.submitSolution.noAutodetect',
    defaultMessage: 'Select one runtime environment'
  },
  resetForm: {
    id: 'app.submitSolution.resetFormButton',
    defaultMessage: 'Reset form'
  },
  closeForm: {
    id: 'app.submitSolution.closeButton',
    defaultMessage: 'Close'
  },
  instructions: {
    id: 'app.submistSolution.instructions',
    defaultMessage:
      'You must attach at least one file with source code and wait, until all your files are uploaded to the server. If there is a problem uploading any of the files, please try uploading it again or remove the file. This form cannot be submitted until there are any files which have not been successfully uploaded or which could not have been uploaded to the server.'
  },
  submissionRejected: {
    id: 'app.submistSolution.submitFailed',
    defaultMessage:
      'Action was rejected by the server. This usually means you have uploaded incorrect files - do your files have proper file type extensions? If you cannot submit the solution and there is no obvious reason, contact your administrator to sort things out.'
  }
});

const submissionMessages = defineMessages({
  title: {
    id: 'app.submitSolution.title',
    defaultMessage: 'Submit the solution'
  },
  noteLabel: {
    id: 'app.submitSolution.noteLabel',
    defaultMessage: 'Note for you and your supervisor(s)'
  },
  submitButton: {
    id: 'app.submitSolution.submitButton',
    defaultMessage: 'Submit the solution'
  },
  submitting: {
    id: 'app.submitSolution.submittingButtonText',
    defaultMessage: 'Submitting the solution ...'
  }
});

const referenceSolutionMessages = defineMessages({
  title: {
    id: 'app.submitRefSolution.title',
    defaultMessage: 'Create reference solution'
  },
  noteLabel: {
    id: 'app.submitRefSolution.noteLabel',
    defaultMessage: 'Description of the reference solution'
  },
  submitButton: {
    id: 'app.submitRefSolution.submitButton',
    defaultMessage: 'Create new reference solution'
  },
  submitting: {
    id: 'app.submitRefSolution.submittingButtonText',
    defaultMessage: 'Creating new reference solution ...'
  }
});

const SubmitSolution = ({
  userId,
  isOpen,
  onClose,
  reset,
  uploadId,
  canSubmit,
  isSending,
  hasFailed,
  note = '',
  runtimeEnvironments,
  changeRuntimeEnvironment,
  autodetection,
  saveNote,
  submitSolution,
  useReferenceMessages,
  messages,
  intl: { formatMessage }
}) =>
  <Modal show={isOpen} backdrop="static" onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>
        {formatMessage(messages.title)}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>
        <UsersNameContainer userId={userId} />
      </p>
      <UploadContainer id={uploadId} />

      {runtimeEnvironments.length > 0 &&
        <FormGroup>
          <ControlLabel>
            {formatMessage(commonMessages.runtimeEnvironment)}
          </ControlLabel>
          <FormControl
            onChange={e => changeRuntimeEnvironment(e.target.value)}
            componentClass="select"
            defaultValue={null}
          >
            <option value={null}>
              {autodetection
                ? formatMessage(commonMessages.detectRte)
                : formatMessage(commonMessages.selectOneRte)}
            </option>
            {runtimeEnvironments.map(rte =>
              <option key={rte.id} value={rte.id}>
                {rte.name}
              </option>
            )}
          </FormControl>
        </FormGroup>}

      <FormGroup>
        <ControlLabel>
          {formatMessage(messages.noteLabel)}
        </ControlLabel>
        <FormControl
          onChange={e => saveNote(e.target.value)}
          value={note}
          type="text"
        />
      </FormGroup>

      {hasFailed &&
        <p className="text-left callout callout-danger">
          {formatMessage(commonMessages.submissionRejected)}
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
          <LoadingIcon /> {formatMessage(messages.submitting)}
        </Button>}

      {!isSending &&
        <Button
          type="submit"
          disabled={!canSubmit}
          bsStyle={hasFailed ? 'danger' : canSubmit ? 'success' : 'default'}
          className="btn-flat"
          onClick={submitSolution}
        >
          {hasFailed ? <WarningIcon /> : <SendIcon />}{' '}
          {formatMessage(messages.submitButton)}
        </Button>}

      <Button bsStyle="default" className="btn-flat" onClick={reset}>
        <DeleteIcon /> {formatMessage(commonMessages.resetForm)}
      </Button>

      <Button bsStyle="default" className="btn-flat" onClick={onClose}>
        <CloseIcon /> {formatMessage(commonMessages.closeForm)}
      </Button>

      {!canSubmit &&
        <HelpBlock className="text-left">
          {formatMessage(commonMessages.instructions)}
        </HelpBlock>}
    </Modal.Footer>
  </Modal>;

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
  runtimeEnvironments: PropTypes.array,
  autodetection: PropTypes.bool,
  changeRuntimeEnvironment: PropTypes.func.isRequired,
  useReferenceMessages: PropTypes.bool,
  messages: PropTypes.object.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(
  connect(
    (state, { useReferenceMessages = false }) => ({
      messages: useReferenceMessages
        ? referenceSolutionMessages
        : submissionMessages
    }),
    () => ({})
  )(SubmitSolution)
);
