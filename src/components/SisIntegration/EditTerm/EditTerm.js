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
  onSubmit,
  dirty = false,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  reset,
}) => (
  <Modal show={isOpen} backdrop="static" onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>
        <FormattedMessage id="app.editSisTerm.title" defaultMessage="Edit SIS Term" />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Field
        name="beginning"
        component={DatetimeField}
        label={<FormattedMessage id="app.editSisTerm.beginning" defaultMessage="Beginning of the term:" />}
      />
      <Field
        name="end"
        component={DatetimeField}
        label={<FormattedMessage id="app.editSisTerm.end" defaultMessage="End of the term:" />}
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
        handleSubmit={handleSubmit(data => onSubmit(data).then(reset))}
        submitting={submitting}
        dirty={dirty}
        hasSucceeded={submitSucceeded}
        hasFailed={submitFailed}
        invalid={invalid}
        messages={{
          submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
          submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
          success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
        }}
      />

      <Button bsStyle="default" className="btn-flat" onClick={onClose}>
        <CloseIcon gapRight />
        <FormattedMessage id="generic.close" defaultMessage="Close" />
      </Button>
    </Modal.Footer>
  </Modal>
);

EditTerm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  dirty: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  reset: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const validate = ({ beginning, end, advertiseUntil }) => {
  const errors = {};

  if (!beginning) {
    errors.beginning = (
      <FormattedMessage id="app.editSisTerm.validation.noBeginning" defaultMessage="Start of the term is required." />
    );
  }

  if (!end) {
    errors.end = (
      <FormattedMessage id="app.editSisTerm.validation.noEnd" defaultMessage="End of the term is required." />
    );
  }

  if (!advertiseUntil) {
    errors.advertiseUntil = (
      <FormattedMessage
        id="app.editSisTerm.validation.noAdvertiseUntil"
        defaultMessage="End date of advertising the term is required."
      />
    );
  }

  const bDate = new Date(beginning * 1000);
  const eDate = new Date(end * 1000);
  const aDate = new Date(advertiseUntil * 1000);

  if (aDate < bDate || aDate > eDate) {
    errors.advertiseUntil = (
      <FormattedMessage
        id="app.editSisTerm.validation.advertiseInLimits"
        defaultMessage="The term can be advertised only in its period."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'edit-sis-term',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(EditTerm);
