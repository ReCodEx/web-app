import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { Modal, Form, FormGroup, FormLabel, FormControl, Row, Col } from 'react-bootstrap';

import { LoadingIcon, WarningIcon, SendIcon, DeleteIcon, CloseIcon } from '../../icons';
import InsetPanel from '../../widgets/InsetPanel';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import UploadContainer from '../../../containers/UploadContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import Confirm from '../../forms/Confirm';

import { uploadedFilesSelector } from '../../../redux/selectors/upload.js';
import { hasEntryPoint } from '../../../redux/selectors/submission.js';
import { getConfigVar } from '../../../helpers/config.js';

const environmentsHelpUrl = getConfigVar('ENVIRONMENTS_INFO_URL');

const commonMessages = defineMessages({
  runtimeEnvironment: {
    id: 'app.submitSolution.runtimeEnvironment',
    defaultMessage: 'Select runtime environment (programming language):',
  },
  uploadFilesFirst: {
    id: 'app.submitSolution.uploadFilesFirst',
    defaultMessage: 'Upload your files first...',
  },
  validating: {
    id: 'app.submitSolution.validating',
    defaultMessage: 'Performing pre-submit validation...',
  },
  noEnvironments: {
    id: 'app.submitSolution.noEnvironments',
    defaultMessage: 'Uploaded files do not meet criteria of any allowed runtime environment.',
  },
  entryPoint: {
    id: 'app.submitSolution.entryPoint',
    defaultMessage: 'Select the point of entry (bootstrap file of your application):',
  },
  emptyNoteWarning: {
    id: 'app.submitSolution.emptyNoteWarning',
    defaultMessage:
      'The description is empty. Reference solutions are strongly encouraged to be labeled with relevant descriptions.',
  },
  emptyNoteSubmitConfirm: {
    id: 'app.submitSolution.emptyNoteSubmitConfirm',
    defaultMessage:
      'The description is empty. Reference solutions are strongly encouraged to be labeled with relevant descriptions. Do you really wish to proceed with submit?',
  },
  resetForm: {
    id: 'generic.reset',
    defaultMessage: 'Reset',
  },
  closeForm: {
    id: 'generic.close',
    defaultMessage: 'Close',
  },
  instructions: {
    id: 'app.submitSolution.instructions',
    defaultMessage:
      'You must attach at least one file with source code and wait, until all your files are uploaded to the server. If there is a problem uploading any of the files, check the name of the file. The name MUST NOT contain non-standard characters (like UTF-8 ones). Then try to upload it again.',
  },
  submissionRejected: {
    id: 'app.submitSolution.submitFailed',
    defaultMessage:
      'Submission was rejected by the server. This usually means you have uploaded incorrect files - do your files have name with ASCII characters only and proper file type extensions? If you cannot submit the solution and there is no obvious reason, contact your supervisor to sort things out.',
  },
  submitButton: {
    id: 'generic.submit',
    defaultMessage: 'Submit',
  },
  submitting: {
    id: 'generic.submitting',
    defaultMessage: 'Submitting...',
  },
  limitsExceeded: {
    id: 'app.submitSolution.limitsExceeded',
    defaultMessage: 'Solution file limits have been exceeded',
  },
  limitsExceededCount: {
    id: 'app.submitSolution.limitsExceededCount',
    defaultMessage: 'You may submit no more than {limit} {limit, plural, one {file} other {files}}.',
  },
  limitsExceededSize: {
    id: 'app.submitSolution.limitsExceededSize',
    defaultMessage: 'Total size of the solution must not exceed {limit} KiB.',
  },
});

const submissionMessages = defineMessages({
  title: {
    id: 'app.submitSolution.title',
    defaultMessage: 'Submit New Solution',
  },
  noteLabel: {
    id: 'app.submitSolution.noteLabel',
    defaultMessage: 'Note for you and your supervisor(s):',
  },
});

const referenceSolutionMessages = defineMessages({
  title: {
    id: 'app.submitRefSolution.title',
    defaultMessage: 'Create Reference Solution',
  },
  noteLabel: {
    id: 'app.submitRefSolution.noteLabel',
    defaultMessage: 'Description of the reference solution:',
  },
});

class SubmitSolution extends Component {
  _createSubmitButton = (btnProps = {}) => {
    const {
      canSubmit,
      presubmitCountLimitOK,
      presubmitSizeLimitOK,
      isReferenceSolution,
      hasFailed,
      intl: { formatMessage },
    } = this.props;
    const limitsOK = isReferenceSolution || (presubmitCountLimitOK && presubmitSizeLimitOK); // ref. solution ignores limits
    return (
      <Button
        type="submit"
        disabled={!canSubmit || !limitsOK}
        variant={hasFailed ? 'danger' : canSubmit ? 'success' : 'secondary'}
        {...btnProps}>
        {hasFailed ? <WarningIcon gapRight={2} /> : <SendIcon gapRight={2} />}
        {formatMessage(commonMessages.submitButton)}
      </Button>
    );
  };

  createSubmitButton = () => {
    const {
      isReferenceSolution,
      note,
      submitSolution,
      intl: { formatMessage },
    } = this.props;
    return isReferenceSolution && note.trim().length === 0 ? (
      <Confirm
        id={'ref-solution-submit'}
        onConfirmed={submitSolution}
        question={formatMessage(commonMessages.emptyNoteSubmitConfirm)}
        placement="top">
        {this._createSubmitButton()}
      </Confirm>
    ) : (
      this._createSubmitButton({
        onClick: submitSolution,
      })
    );
  };

  render() {
    const {
      userId,
      isOpen,
      onClose,
      onFilesChange,
      reset,
      uploadId,
      isSending,
      isValidating,
      hasFailed,
      note = '',
      attachedFiles,
      presubmitEnvironments,
      presubmitVariables,
      presubmitCountLimitOK,
      presubmitSizeLimitOK,
      solutionFilesLimit = null,
      solutionSizeLimit = null,
      selectedEnvironment,
      changeRuntimeEnvironment,
      selectedEntryPoint,
      changeEntryPoint,
      saveNote,
      isReferenceSolution,
      messages,
      intl: { formatMessage },
    } = this.props;

    return (
      <Modal show={isOpen} backdrop="static" onHide={onClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{formatMessage(messages.title)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <UsersNameContainer userId={userId} />
          </p>

          <Row>
            <Col md={12} lg={6}>
              <UploadContainer id={uploadId} onChange={onFilesChange} />

              {(!presubmitCountLimitOK || !presubmitSizeLimitOK) && (
                <Callout variant={isReferenceSolution ? 'warning' : 'danger'}>
                  <h4>
                    <WarningIcon gapRight={2} />
                    {formatMessage(commonMessages.limitsExceeded)}
                  </h4>
                  {!presubmitCountLimitOK && (
                    <p>{formatMessage(commonMessages.limitsExceededCount, { limit: solutionFilesLimit })}</p>
                  )}
                  {!presubmitSizeLimitOK && (
                    <p>
                      {formatMessage(commonMessages.limitsExceededSize, { limit: Math.ceil(solutionSizeLimit / 1024) })}
                    </p>
                  )}
                </Callout>
              )}
            </Col>
            <Col md={12} lg={6}>
              <FormGroup className="mb-3">
                <FormLabel>{formatMessage(commonMessages.runtimeEnvironment)}</FormLabel>
                {isValidating ? (
                  <p>
                    <LoadingIcon gapRight={2} />
                    {formatMessage(commonMessages.validating)}
                  </p>
                ) : !presubmitEnvironments ? (
                  <Callout variant="info">{formatMessage(commonMessages.uploadFilesFirst)}</Callout>
                ) : presubmitEnvironments.length > 0 ? (
                  <>
                    <FormControl
                      onChange={e => changeRuntimeEnvironment(e.target.value)}
                      as="select"
                      defaultValue={selectedEnvironment}>
                      {presubmitEnvironments.map(rte => (
                        <option key={rte.id} value={rte.id}>
                          {rte.name}
                        </option>
                      ))}
                    </FormControl>
                    {environmentsHelpUrl && (
                      <p className="small text-body-secondary mt-3">
                        <FormattedMessage
                          id="app.submitSolution.linkToWiki"
                          defaultMessage="Select the right environment, under which you wish to submit your solution. You may find more information about the environments at our <a>wiki page</a>."
                          values={{
                            a: contents => (
                              <a href={environmentsHelpUrl} target="_blank" rel="noreferrer">
                                {Array.isArray(contents)
                                  ? contents.map((c, i) => <React.Fragment key={i}>{c}</React.Fragment>)
                                  : contents}
                              </a>
                            ),
                          }}
                        />
                      </p>
                    )}
                  </>
                ) : (
                  <Callout variant="danger">{formatMessage(commonMessages.noEnvironments)}</Callout>
                )}
              </FormGroup>

              {Boolean(
                !isValidating &&
                  presubmitVariables &&
                  presubmitVariables.length > 0 &&
                  attachedFiles &&
                  attachedFiles.length > 1 &&
                  hasEntryPoint(presubmitVariables, selectedEnvironment)
              ) && (
                <FormGroup className="mb-3">
                  <FormLabel className={selectedEntryPoint ? '' : 'text-danger'}>
                    {formatMessage(commonMessages.entryPoint)}
                  </FormLabel>
                  <FormControl
                    onChange={e => changeEntryPoint(e.target.value)}
                    as="select"
                    defaultValue={selectedEntryPoint}>
                    <option value="">...</option>
                    {attachedFiles
                      .map(item => item.name)
                      .sort()
                      .map(file => (
                        <option key={file} value={file}>
                          {file}
                        </option>
                      ))}
                  </FormControl>
                </FormGroup>
              )}

              <hr />

              <FormGroup className="mb-3">
                <FormLabel>{formatMessage(messages.noteLabel)}</FormLabel>
                <FormControl onChange={e => saveNote(e.target.value)} value={note} type="text" maxLength={1024} />
              </FormGroup>
              {isReferenceSolution && note.trim().length === 0 && (
                <Callout variant="danger">{formatMessage(commonMessages.emptyNoteWarning)}</Callout>
              )}
            </Col>
          </Row>
          {hasFailed && <Callout variant="danger">{formatMessage(commonMessages.submissionRejected)}</Callout>}
        </Modal.Body>
        <Modal.Footer>
          <div className="text-center m-3-bottomm">
            <TheButtonGroup>
              {isSending && (
                <Button type="submit" disabled={true} variant="success">
                  <LoadingIcon gapRight={2} />
                  {formatMessage(commonMessages.submitting)}
                </Button>
              )}

              {!isSending && this.createSubmitButton()}

              <Button variant="outline-secondary" onClick={reset}>
                <DeleteIcon gapRight={2} />
                {formatMessage(commonMessages.resetForm)}
              </Button>

              <Button variant="outline-secondary" onClick={onClose}>
                <CloseIcon gapRight={2} />
                {formatMessage(commonMessages.closeForm)}
              </Button>
            </TheButtonGroup>
          </div>

          <InsetPanel className="mt-3">
            <Form.Text className="text-start">{formatMessage(commonMessages.instructions)}</Form.Text>
          </InsetPanel>
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
  solutionFilesLimit: PropTypes.number,
  solutionSizeLimit: PropTypes.number,
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
  presubmitCountLimitOK: PropTypes.bool,
  presubmitSizeLimitOK: PropTypes.bool,
  selectedEnvironment: PropTypes.string,
  changeRuntimeEnvironment: PropTypes.func.isRequired,
  selectedEntryPoint: PropTypes.string,
  changeEntryPoint: PropTypes.func.isRequired,
  isReferenceSolution: PropTypes.bool,
  attachedFiles: PropTypes.array,
  messages: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(
  connect(
    (state, { uploadId, isReferenceSolution = false }) => ({
      attachedFiles: uploadedFilesSelector(state, uploadId),
      messages: isReferenceSolution ? referenceSolutionMessages : submissionMessages,
    }),
    () => ({})
  )(SubmitSolution)
);
