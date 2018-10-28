import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

// import isInt from 'validator/lib/isInt';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import { TextField, DatetimeField } from '../Fields';

const AddLicenceForm = ({
  submitting,
  anyTouched,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  asyncValidating,
  invalid
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.addLicence.addLicenceTitle"
        defaultMessage="Add New Licence"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    isOpen={false}
    collapsable={true}
    footer={
      <div className="text-center">
        <SubmitButton
          id="addLicence"
          handleSubmit={handleSubmit}
          dirty={anyTouched}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          asyncValidating={asyncValidating}
          messages={{
            submit: (
              <FormattedMessage
                id="app.addLicence.set"
                defaultMessage="Add licence"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.addLicence.processing"
                defaultMessage="Adding..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.addLicence.success"
                defaultMessage="Licence was added."
              />
            )
          }}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.addLicence.failed"
          defaultMessage="Cannot add the licence."
        />
      </Alert>}

    <Field
      name="note"
      component={TextField}
      label={
        <FormattedMessage id="app.addLicence.note" defaultMessage="Note:" />
      }
    />
    <Field
      name="validUntil"
      component={DatetimeField}
      label={
        <FormattedMessage
          id="app.addLicence.validUntil"
          defaultMessage="Valid until:"
        />
      }
    />
  </FormBox>;

AddLicenceForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

const validate = ({ note, validUntil }) => {
  const errors = {};

  if (!note || note.length === 0) {
    errors['note'] = (
      <FormattedMessage
        id="app.addLicence.validation.note"
        defaultMessage="Note cannot be empty."
      />
    );
  }

  if (!validUntil) {
    errors['validUntil'] = (
      <FormattedMessage
        id="app.addLicence.validation.validUntilEmpty"
        defaultMessage="The expiration date of the valid period of the licence must be set."
      />
    );
  } else if (validUntil.isBefore(Date.now())) {
    errors['validUntil'] = (
      <FormattedMessage
        id="app.addLicence.validation.validUntilInThePast"
        defaultMessage="The expiration date of the valid period of the licence must be in the future."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'addLicence',
  validate
})(AddLicenceForm);
