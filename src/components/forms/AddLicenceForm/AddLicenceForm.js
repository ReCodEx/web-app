import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import Callout from '../../widgets/Callout';
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
  invalid,
}) => (
  <FormBox
    title={<FormattedMessage id="app.addLicense.addLicenseTitle" defaultMessage="Add New License" />}
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
            submit: <FormattedMessage id="app.addLicense.set" defaultMessage="Add license" />,
            submitting: <FormattedMessage id="app.addLicense.processing" defaultMessage="Adding..." />,
            success: <FormattedMessage id="app.addLicense.success" defaultMessage="License was added." />,
          }}
        />
      </div>
    }>
    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage id="app.addLicense.failed" defaultMessage="Cannot add the license." />
      </Callout>
    )}

    <Field
      name="note"
      component={TextField}
      maxLength={255}
      label={<FormattedMessage id="app.addLicense.note" defaultMessage="Note:" />}
    />
    <Field
      name="validUntil"
      component={DatetimeField}
      label={<FormattedMessage id="app.addLicense.validUntil" defaultMessage="Valid until:" />}
    />
  </FormBox>
);

AddLicenceForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

const validate = ({ note, validUntil }) => {
  const errors = {};

  if (!note || note.length === 0) {
    errors.note = <FormattedMessage id="app.addLicense.validation.note" defaultMessage="Note cannot be empty." />;
  }

  if (!validUntil) {
    errors.validUntil = (
      <FormattedMessage
        id="app.addLicense.validation.validUntilEmpty"
        defaultMessage="The expiration date of the valid period of the license must be set."
      />
    );
  } else if (validUntil.isBefore(Date.now())) {
    errors.validUntil = (
      <FormattedMessage
        id="app.addLicense.validation.validUntilInThePast"
        defaultMessage="The expiration date of the valid period of the license must be in the future."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'addLicence',
  validate,
})(AddLicenceForm);
