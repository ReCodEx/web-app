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
import { AddIcon, RefreshIcon } from '../../icons';

class EditTestsForm extends Component {
  render() {
    const {
      readOnly = false,
      dirty,
      submitting,
      handleSubmit,
      reset,
      change,
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

        {!readOnly &&
          formValues &&
          formValues.tests.length > 0 &&
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
          />}

        <FieldArray
          name="tests"
          component={EditTestsTest}
          readOnly={readOnly}
          isUniform={formValues ? formValues.isUniform === true : true}
        />

        {!readOnly &&
          <div className="text-center">
            {formValues &&
              formValues.tests.length < 99 &&
              <Button
                onClick={() =>
                  change('tests', [
                    ...formValues.tests,
                    {
                      name:
                        'Test ' +
                        (formValues.tests.length + 1)
                          .toString()
                          .padStart(2, '0'),
                      weight: '100'
                    }
                  ])}
                bsStyle={'primary'}
              >
                <AddIcon gapRight />
                <FormattedMessage
                  id="app.editTestsTest.add"
                  defaultMessage="Add Test"
                />
              </Button>}

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
                    defaultMessage="Saving Tests..."
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
          </div>}
      </div>
    );
  }
}

EditTestsForm.propTypes = {
  readOnly: PropTypes.bool,
  values: PropTypes.array,
  reset: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
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
    } else if (!test.name.match(/^[-a-zA-Z0-9_()[\].! ]+$/)) {
      testErrors['name'] = (
        <FormattedMessage
          id="app.editTestsForm.validation.testNameInvalidCharacters"
          defaultMessage="The test name contains invalid characters. The test name must follow certain restrictions since it is used as a name of directory."
        />
      );
    } else if (knownTests.has(test.name)) {
      testErrors['name'] = (
        <FormattedMessage
          id="app.editTestsForm.validation.testNameTaken"
          defaultMessage="This name is taken, please fill different one."
        />
      );
    } else {
      knownTests.add(test.name);
    }

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
