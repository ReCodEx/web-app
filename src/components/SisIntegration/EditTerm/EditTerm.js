import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { CloseIcon } from '../../icons';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm } from 'redux-form';
import DatetimeField from '../../forms/Fields/DatetimeField';
import SubmitButton from '../../forms/SubmitButton';

const EditTerm = ({
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
          id="app.editSisTerm.title"
          defaultMessage="Edit SIS Term"
        />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Field
        name="beginning"
        component={DatetimeField}
        label={
          <FormattedMessage
            id="app.editSisTerm.beginning"
            defaultMessage="Beginning of the term:"
          />
        }
      />
      <Field
        name="end"
        component={DatetimeField}
        label={
          <FormattedMessage
            id="app.editSisTerm.end"
            defaultMessage="End of the term:"
          />
        }
      />
      <Field
        name="advertiseUntil"
        component={DatetimeField}
        label={
          <FormattedMessage
            id="app.editSisTerm.advertiseUntil"
            defaultMessage="Advertise this term to students until:"
          />
        }
      />
    </Modal.Body>
    <Modal.Footer>
      <SubmitButton
        id="edit-sis-term"
        handleSubmit={data => handleSubmit(data).then(() => reset())}
        submitting={submitting}
        dirty={anyTouched}
        hasSucceeded={submitSucceeded}
        hasFailed={submitFailed}
        invalid={invalid}
        messages={{
          submit: (
            <FormattedMessage id="app.editSisTerm.save" defaultMessage="Save" />
          ),
          submitting: (
            <FormattedMessage
              id="app.editSisTerm.saving"
              defaultMessage="Saving ..."
            />
          ),
          success: (
            <FormattedMessage
              id="app.editSisTerm.successs"
              defaultMessage="Saved"
            />
          )
        }}
      />

      <Button bsStyle="default" className="btn-flat" onClick={onClose}>
        <CloseIcon />{' '}
        <FormattedMessage id="app.editSisTerm.close" defaultMessage="Close" />
      </Button>
    </Modal.Footer>
  </Modal>;

EditTerm.propTypes = {
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

export default reduxForm({ form: 'edit-sis-term' })(EditTerm);
