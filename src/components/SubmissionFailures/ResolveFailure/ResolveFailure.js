import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { CloseIcon } from '../../icons';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm } from 'redux-form';
import SubmitButton from '../../forms/SubmitButton';
import { TextField, CheckboxField } from '../../forms/Fields';

const maxNoteLength = value =>
  value && value.length >= 255
    ? <FormattedMessage
        id="app.submissionFailures.resolveMaxLengthExceeded"
        defaultMessage="Maximum length of the note exceeded."
      />
    : undefined;

const ResolveFailure = ({
  isOpen,
  onClose,
  submitting,
  handleSubmit,
  anyTouched,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  reset
}) =>
  <Modal show={isOpen} backdrop="static" onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>
        <FormattedMessage
          id="app.submissionFailures.resolveTitle"
          defaultMessage="Resolve Failure"
        />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Field
        name="note"
        component={TextField}
        label={
          <FormattedMessage
            id="app.submissionFailures.resolveNote"
            defaultMessage="Resolve note:"
          />
        }
        validate={maxNoteLength}
      />
      <Field
        name="sendEmail"
        component={CheckboxField}
        onOff
        label={
          <FormattedMessage
            id="app.submissionFailures.sendEmail"
            defaultMessage="Send email"
          />
        }
      />
    </Modal.Body>
    <Modal.Footer>
      <SubmitButton
        id="resolve-failure"
        handleSubmit={data => handleSubmit(data).then(() => reset())}
        submitting={submitting}
        dirty={anyTouched}
        hasSucceeded={submitSucceeded}
        hasFailed={submitFailed}
        invalid={invalid}
        messages={{
          submit: (
            <FormattedMessage
              id="app.submissionFailures.resolveSave"
              defaultMessage="Save"
            />
          ),
          submitting: (
            <FormattedMessage
              id="app.submissionFailures.resolveSaving"
              defaultMessage="Saving ..."
            />
          ),
          success: (
            <FormattedMessage
              id="app.submissionFailures.resolveSuccesss"
              defaultMessage="Saved"
            />
          )
        }}
      />

      <Button bsStyle="default" className="btn-flat" onClick={onClose}>
        <CloseIcon />{' '}
        <FormattedMessage
          id="app.submissionFailures.resolveClose"
          defaultMessage="Close"
        />
      </Button>
    </Modal.Footer>
  </Modal>;

ResolveFailure.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  anyTouched: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  reset: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
};

export default reduxForm({ form: 'resolve-failure' })(ResolveFailure);
