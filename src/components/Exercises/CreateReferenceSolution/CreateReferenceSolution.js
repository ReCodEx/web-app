import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import { Table } from 'react-bootstrap';
import ResourceRenderer from '../../ResourceRenderer';
import Icon from 'react-fontawesome';
import {
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
import { SelectField } from '../../Forms/Fields';

const CreateReferenceSolution = (
  {
    exercise,
    note = '',
    runtime = '',
    canSubmit,
    reset,
    isSending,
    hasFailed,
    createReferenceSolution,
    ...props
  }
) => (
  <div>
    <UploadContainer id={exercise.id} />

    <FormGroup>
      <ControlLabel>
        <FormattedMessage
          id="app.exercise.uploadReferenceSolution.noteLabel"
          defaultMessage="Description of the provided exercise solution"
        />
      </ControlLabel>
      <FormControl value={note} type="text" />
    </FormGroup>

    {hasFailed &&
      <p className="text-left callout callout-danger">
        <FormattedMessage
          id="app.exercise.uploadReferenceSolution.creationFailed"
          defaultMessage="Solution was rejected by the server."
        />
      </p>}

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
          id="app.exercise.uploadReferenceSolution.creatingButtonText"
          defaultMessage="Creating solution ..."
        />
      </Button>}

    {!isSending &&
      <Button
        type="submit"
        disabled={!canSubmit}
        bsStyle={hasFailed ? 'danger' : canSubmit ? 'success' : 'default'}
        className="btn-flat"
        onClick={createReferenceSolution}
      >
        {hasFailed ? <WarningIcon /> : <SendIcon />}
        {' '}
        <FormattedMessage
          id="app.exercise.uploadReferenceSolution.createButton"
          defaultMessage="Create solution"
        />
      </Button>}

    <Button bsStyle="default" className="btn-flat" onClick={reset}>
      <DeleteIcon />
      {' '}
      <FormattedMessage
        id="app.exercise.uploadReferenceSolution.resetFormButton"
        defaultMessage="Reset form"
      />
    </Button>

    {!canSubmit &&
      <HelpBlock>
        <FormattedMessage
          id="app.exercise.uploadReferenceSolution.instructions"
          defaultMessage="You must attach at least one file with source code and wait, until all your files are uploaded to the server. If there is a problem uploading any of the files, please try uploading it again or remove the file. This form cannot be submitted until there are any files which have not been successfully uploaded or which could not have been uploaded to the server."
        />
      </HelpBlock>}
  </div>
);

CreateReferenceSolution.propTypes = {
  exercise: PropTypes.object.isRequired,
  note: PropTypes.string,
  runtime: PropTypes.string,
  reset: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool.isRequired,
  createReferenceSolution: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool,
  isSending: PropTypes.bool
};

export default CreateReferenceSolution;
