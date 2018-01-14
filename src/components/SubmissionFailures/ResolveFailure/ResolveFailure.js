import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { CloseIcon } from '../../icons';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm } from 'redux-form';
import TextField from '../../forms/Fields/TextField';
import SubmitButton from '../../forms/SubmitButton';

const ResolveFailure = ({
  isOpen,
  onClose,
  submitting,
  handleSubmit,
  anyTouched,
  submitFailed = false,
  submitSucceeded = false,
  invalid
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
      />
    </Modal.Body>
    <Modal.Footer>
      <SubmitButton
        id="resolve-failure"
        handleSubmit={handleSubmit}
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
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
};

export default reduxForm({ form: 'resolve-failure' })(ResolveFailure);
