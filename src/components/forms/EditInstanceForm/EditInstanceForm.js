import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';

import { CheckboxField } from '../Fields';

const EditInstanceForm = ({
  submitting,
  handleSubmit,
  anyTouched,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
}) => (
  <FormBox
    title={<FormattedMessage id="app.editInstanceForm.title" defaultMessage="Edit instance" />}
    type={submitSucceeded ? 'success' : undefined}
    isOpen
    collapsable
    footer={
      <div className="text-center">
        <SubmitButton
          id="editInstance"
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          dirty={anyTouched}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: <FormattedMessage id="app.editInstanceForm.set" defaultMessage="Update instance" />,
            submitting: <FormattedMessage id="app.editInstanceForm.processing" defaultMessage="Saving..." />,
            success: <FormattedMessage id="app.editInstanceForm.success" defaultMessage="Instance was updated." />,
          }}
        />
      </div>
    }>
    {submitFailed && (
      <Alert variant="danger">
        <FormattedMessage id="app.editInstanceForm.failed" defaultMessage="Cannot update instance." />
      </Alert>
    )}

    <Field
      name="isOpen"
      component={CheckboxField}
      onOff
      label={<FormattedMessage id="app.editInstanceForm.isOpen" defaultMessage="Is open" />}
    />
  </FormBox>
);

EditInstanceForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
};

const validate = () => {
  const errors = {};
  return errors;
};

export default reduxForm({
  form: 'editInstance',
  validate,
})(EditInstanceForm);
