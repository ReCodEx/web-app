import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray, Field, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import EditTestsTest from './EditTestsTest';
import { CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';

class EditTestsForm extends Component {
  render() {
    const {
      dirty,
      submitting,
      handleSubmit,
      reset,
      submitFailed,
      submitSucceeded,
      invalid,
      formValues
    } = this.props;

    return (
      <div>
        {submitFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="generic.savingFailed"
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
          {dirty &&
            !submitting &&
            !submitSucceeded &&
            <span>
              <Button
                type="reset"
                onClick={reset}
                bsStyle={'danger'}
                className="btn-flat"
              >
                <RefreshIcon gapRight />
                <FormattedMessage id="generic.reset" defaultMessage="Reset" />
              </Button>
            </span>}

          <SubmitButton
            id="editTests"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={submitSucceeded}
            dirty={dirty}
            hasFailed={submitFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.editTestsForm.submit"
                  defaultMessage="Save Tests"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editTestsForm.submitting"
                  defaultMessage="Saving Tests ..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editTestsForm.success"
                  defaultMessage="Tests Saved."
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
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  formValues: PropTypes.object
};

const validate = ({ isUniform, tests }) => {
  const errors = {};

  const testsErrors = {};
  const knownTests = new Set();
  for (let i = 0; i < tests.length; ++i) {
    const test = tests[i];
    const testErrors = {};
    if (!test.name || test.name === '') {
      testErrors['name'] = (
        <FormattedMessage
          id="app.editTestsForm.validation.testName"
          defaultMessage="Please fill test name."
        />
      );
    }
    if (knownTests.has(test.name)) {
      testErrors['name'] = (
        <FormattedMessage
          id="app.editTestsForm.validation.testNameTaken"
          defaultMessage="This name is taken, please fill different one."
        />
      );
    }
    knownTests.add(test.name);
    if (!isUniform && (!test.weight || test.weight === '')) {
      testErrors['weight'] = (
        <FormattedMessage
          id="app.editTestsForm.validation.testWeightEmpty"
          defaultMessage="Please fill test weight."
        />
      );
    }
    const weight = Number.parseInt(test.weight);
    if (!isUniform && (!Number.isFinite(weight) || weight < 0)) {
      testErrors['weight'] = (
        <FormattedMessage
          id="app.editTestsForm.validation.testWeight"
          defaultMessage="Test weight must be positive integer."
        />
      );
    }
    testsErrors[i] = testErrors;
  }
  errors['tests'] = testsErrors;
  return errors;
};

export default connect(state => {
  return {
    formValues: getFormValues('editTests')(state)
  };
})(
  reduxForm({
    form: 'editTests',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    validate
  })(EditTestsForm)
);
