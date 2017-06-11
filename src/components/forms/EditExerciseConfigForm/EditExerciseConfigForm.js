import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import SubmitButton from '../SubmitButton';
import EditExerciseConfigEnvironment from './EditExerciseConfigEnvironment';

class EditExerciseConfigForm extends Component {
  state = { testConfigs: [] };

  componentDidMount() {
    const { initialValues } = this.props;
    this.setState({ testConfigs: initialValues.config });
  }

  /* componentWillReceiveProps(newProps) {
    this.setState({
      testConfigs: newProps.testConfigs
    });
  } */

  addTest() {
    this.setState((prevState, props) => {
      return {
        testConfigs: prevState.testConfigs.map(testConfig => {
          if (!testConfig.tests) {
            testConfig.tests = [];
          }
          testConfig.tests = testConfig.tests.concat([
            {
              name: 'Test ' + (testConfig.tests.length + 1)
            }
          ]);
          return testConfig;
        })
      };
    });
  }

  render() {
    const {
      runtimeEnvironments,
      anyTouched,
      submitting,
      handleSubmit,
      // testConfigs,
      hasFailed = false,
      hasSucceeded = false,
      invalid
    } = this.props;
    return (
      <div>
        {hasFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="app.editExerciseConfigForm.failed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        <FieldArray
          name="config"
          component={EditExerciseConfigEnvironment}
          testConfigs={this.state.testConfigs}
          // testConfigs={testConfigs}
          runtimeEnvironments={runtimeEnvironments}
        />

        <p className="text-center">
          <SubmitButton
            id="editExerciseConfig"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={hasSucceeded}
            dirty={anyTouched}
            hasFailed={hasFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.editExerciseConfigForm.submit"
                  defaultMessage="Change configuration"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editExerciseConfigForm.submitting"
                  defaultMessage="Saving configuration ..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editExerciseConfigForm.success"
                  defaultMessage="Configuration was changed."
                />
              )
            }}
          />
          <Button
            onClick={() => this.addTest()}
            bsStyle={'info'}
            className="btn-flat"
          >
            <Icon name="plus" />
            {' '}
            <FormattedMessage
              id="app.editExerciseConfigForm.addTest"
              defaultMessage="Add new test"
            />
          </Button>
        </p>
      </div>
    );
  }
}

EditExerciseConfigForm.propTypes = {
  initialValues: PropTypes.object,
  values: PropTypes.array,
  // testConfigs: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  runtimeEnvironments: PropTypes.object.isRequired
};

const validate = () => {};

export default reduxForm({
  form: 'editExerciseConfig',
  validate
})(EditExerciseConfigForm);
