import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import {
  Modal,
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Well,
  Row,
  Col
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
import Confirm from '../../forms/Confirm';

import { createGetUploadedFiles } from '../../../redux/selectors/upload';
import { hasEntryPoint } from '../../../redux/selectors/submission';

const commonMessages = defineMessages({
  runtimeEnvironment: {
    id: 'app.submitSolution.runtimeEnvironment',
    defaultMessage: 'Select runtime environment (programming language):'
  },
  uploadFilesFirst: {
    id: 'app.submitSolution.uploadFilesFirst',
    defaultMessage: 'Upload your files first...'
  },
  validating: {
    id: 'app.submitSolution.validating',
    defaultMessage: 'Performing pre-submit validation...'
  },
  noEnvironments: {
    id: 'app.submitSolution.noEnvironments',
    defaultMessage:
      'Uploaded files do not meet criteria of any allowed runtime environment.'
  },
  entryPoint: {
    id: 'app.submitSolution.entryPoint',
    defaultMessage:
      'Select the point of entry (bootstrap file of your application):'
  },
  emptyNoteWarning: {
    id: 'app.submitSolution.emptyNoteWarning',
    defaultMessage:
      'The description is empty. Reference solutions are strongly encouraged to be labeled with relevant descriptions.'
  },
  emptyNoteSubmitConfirm: {
    id: 'app.submitSolution.emptyNoteSubmitConfirm',
    defaultMessage:
      'The description is empty. Reference solutions are strongly encouraged to be labeled with relevant descriptions. Do you rellay wish to proceed with submit?'
  },
  resetForm: {
    id: 'generic.reset',
    defaultMessage: 'Reset'
  },
  closeForm: {
    id: 'generic.close',
    defaultMessage: 'Close'
  },
  instructions: {
    id: 'app.submistSolution.instructions',
    defaultMessage:
      'You must attach at least one file with source code and wait, until all your files are uploaded to the server. If there is a problem uploading any of the files, check the name of the file. The name MUST NOT contain non-standard characters (like UTF-8 ones). Then try to upload it again.'
  },
  submissionRejected: {
    id: 'app.submistSolution.submitFailed',
    defaultMessage:
      'Submission was rejected by the server. This usually means you have uploaded incorrect files - do your files have name with ASCII characters only and proper file type extensions? If you cannot submit the solution and there is no obvious reason, contact your supervisor to sort things out.'
  },
  submitButton: {
    id: 'generic.submit',
    defaultMessage: 'Submit'
  },
  submitting: {
    id: 'generic.submitting',
    defaultMessage: 'Submitting...'
  }
});

const submissionMessages = defineMessages({
  title: {
    id: 'app.submitSolution.title',
    defaultMessage: 'Submit New Solution'
  },
  noteLabel: {
    id: 'app.submitSolution.noteLabel',
    defaultMessage: 'Note for you and your supervisor(s):'
  }
});

const referenceSolutionMessages = defineMessages({
  title: {
    id: 'app.submitRefSolution.title',
    defaultMessage: 'Create Reference Solution'
  },
  noteLabel: {
    id: 'app.submitRefSolution.noteLabel',
    defaultMessage: 'Description of the reference solution:'
  }
});

class SubmitSolution extends Component {
  _createSubmitButton = (btnProps = {}) => {
    const { canSubmit, hasFailed, intl: { formatMessage } } = this.props;
    return (
      <Button
        type="submit"
        disabled={!canSubmit}
        bsStyle={hasFailed ? 'danger' : canSubmit ? 'success' : 'default'}
        className="btn-flat"
        {...btnProps}
      >
        {hasFailed ? <WarningIcon gapRight /> : <SendIcon gapRight />}
        {formatMessage(commonMessages.submitButton)}
      </Button>
    );
  };

  createSubmitButton = () => {
    const {
      isReferenceSolution,
      note,
      submitSolution,
      intl: { formatMessage }
    } = this.props;
    return isReferenceSolution && note.trim().length === 0
      ? <Confirm
          id={'ref-solution-submit'}
          onConfirmed={submitSolution}
          question={formatMessage(commonMessages.emptyNoteSubmitConfirm)}
          placement="top"
        >
          {this._createSubmitButton()}
        </Confirm>
      : this._createSubmitButton({
          onClick: submitSolution
        });
  };

  render() {
    const {
      userId,
      isOpen,
      onClose,
      onFilesChange,
      reset,
      uploadId,
      canSubmit,
      isSending,
      isValidating,
      hasFailed,
      note = '',
      attachedFiles,
      presubmitEnvironments,
      presubmitVariables,
      selectedEnvironment,
      changeRuntimeEnvironment,
      selectedEntryPoint,
      changeEntryPoint,
      saveNote,
      isReferenceSolution,
      messages,
      intl: { formatMessage }
    } = this.props;

    return (
      <Modal show={isOpen} backdrop="static" onHide={onClose} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>
            {formatMessage(messages.title)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <UsersNameContainer userId={userId} />
          </p>

          <Row>
            <Col md={12} lg={6}>
              <UploadContainer id={uploadId} onChange={onFilesChange} />
            </Col>
            <Col md={12} lg={6}>
              <FormGroup>
                <ControlLabel>
                  {formatMessage(commonMessages.runtimeEnvironment)}
                </ControlLabel>
                {isValidating
                  ? <p>
                      <LoadingIcon gapRight />
                      {formatMessage(commonMessages.validating)}
                    </p>
                  : !presubmitEnvironments
                    ? <p className="text-left callout callout-info">
                        {formatMessage(commonMessages.uploadFilesFirst)}
                      </p>
                    : presubmitEnvironments.length > 0
                      ? <FormControl
                          onChange={e =>
                            changeRuntimeEnvironment(e.target.value)}
                          componentClass="select"
                          defaultValue={selectedEnvironment}
                        >
                          {presubmitEnvironments.map(rte =>
                            <option key={rte.id} value={rte.id}>
                              {rte.name}
                            </option>
                          )}
                        </FormControl>
                      : <p className="text-left callout callout-danger">
                          {formatMessage(commonMessages.noEnvironments)}
                        </p>}
              </FormGroup>

              {Boolean(
                !isValidating &&
                  presubmitVariables &&
                  presubmitVariables.length > 0 &&
                  attachedFiles &&
                  attachedFiles.length > 1 &&
                  hasEntryPoint(presubmitVariables, selectedEnvironment)
              ) &&
                <FormGroup>
                  <ControlLabel>
                    {formatMessage(commonMessages.entryPoint)}
                  </ControlLabel>
                  <FormControl
                    onChange={e => changeEntryPoint(e.target.value)}
                    componentClass="select"
                    defaultValue={selectedEntryPoint}
                  >
                    {attachedFiles.map(item => item.name).sort().map(file =>
                      <option key={file} value={file}>
                        {file}
                      </option>
                    )}
                  </FormControl>
                </FormGroup>}

              <hr />

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
              {isReferenceSolution &&
                note.trim().length === 0 &&
                <p className="callout callout-danger">
                  {formatMessage(commonMessages.emptyNoteWarning)}
                </p>}
            </Col>
          </Row>
          {hasFailed &&
            <p className="text-left callout callout-danger">
              {formatMessage(commonMessages.submissionRejected)}
            </p>}
        </Modal.Body>
        <Modal.Footer>
          <div className="text-center em-margin-bottomm">
            {isSending &&
              <Button
                type="submit"
                disabled={true}
                bsStyle="success"
                className="btn-flat"
              >
                <LoadingIcon gapRight />
                {formatMessage(commonMessages.submitting)}
              </Button>}

            {!isSending && this.createSubmitButton()}

            <Button bsStyle="default" className="btn-flat" onClick={reset}>
              <DeleteIcon gapRight />
              {formatMessage(commonMessages.resetForm)}
            </Button>

            <Button bsStyle="default" className="btn-flat" onClick={onClose}>
              <CloseIcon gapRight />
              {formatMessage(commonMessages.closeForm)}
            </Button>
          </div>

          {!canSubmit &&
            <Well className="em-margin-top">
              <HelpBlock className="text-left">
                {formatMessage(commonMessages.instructions)}
              </HelpBlock>
            </Well>}
        </Modal.Footer>
      </Modal>
    );
  }
}
SubmitSolution.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onFilesChange: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  uploadId: PropTypes.string.isRequired,
  canSubmit: PropTypes.bool.isRequired,
  submitSolution: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  note: PropTypes.string,
  saveNote: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool,
  isProcessing: PropTypes.bool,
  isValidating: PropTypes.bool,
  isSending: PropTypes.bool,
  presubmitEnvironments: PropTypes.array,
  presubmitVariables: PropTypes.array,
  selectedEnvironment: PropTypes.string,
  changeRuntimeEnvironment: PropTypes.func.isRequired,
  selectedEntryPoint: PropTypes.string,
  changeEntryPoint: PropTypes.func.isRequired,
  isReferenceSolution: PropTypes.bool,
  attachedFiles: PropTypes.array,
  messages: PropTypes.object.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(
  connect(
    (state, { uploadId, isReferenceSolution = false }) => ({
      attachedFiles: createGetUploadedFiles(uploadId)(state),
      messages: isReferenceSolution
        ? referenceSolutionMessages
        : submissionMessages
    }),
    () => ({})
  )(SubmitSolution)
);
