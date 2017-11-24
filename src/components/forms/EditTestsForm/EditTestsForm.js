import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray, Field, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import EditTestsTest from './EditTestsTest';
import { CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';

class EditTestsForm extends Component {
  render() {
    const {
      anyTouched,
      submitting,
      handleSubmit,
      hasFailed = false,
      hasSucceeded = false,
      invalid,
      formValues
    } = this.props;

    return (
      <div>
        {hasFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="app.editTestsForm.failed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        <Field
          name="isUniform"
          component={CheckboxField}
          onOff
          label={
            <FormattedMessage
              id="app.editTestsForm.isUniform"
              defaultMessage="Using uniform point distribution for all tests"
            />
          }
        />

        <FieldArray
          name="tests"
          component={EditTestsTest}
          isUniform={formValues ? formValues.isUniform === true : true}
        />

        <div className="text-center">
          <SubmitButton
            id="editTests"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={hasSucceeded}
            dirty={anyTouched}
            hasFailed={hasFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.editTestsForm.submit"
                  defaultMessage="Change configuration"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editTestsForm.submitting"
                  defaultMessage="Saving configuration ..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editTestsForm.success"
                  defaultMessage="Configuration was changed."
                />
              )
            }}
          />
        </div>
      </div>
    );
  }
}

EditTestsForm.propTypes = {
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  formValues: PropTypes.object
};

const validate = () => {
  const errors = {};

  return errors;
};

export default connect(state => {
  return {
    formValues: getFormValues('editTests')(state)
  };
})(
  reduxForm({
    form: 'editTests',
    validate
  })(EditTestsForm)
);
