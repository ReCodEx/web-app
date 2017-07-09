import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import SubmitButton from '../SubmitButton';
import EditPipelines from './EditPipelines';

import FormBox from '../../widgets/FormBox';

class EditPipelinesForm extends Component {
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

  removeLastTest() {
    this.setState((prevState, props) => {
      return {
        testConfigs: prevState.testConfigs.map(testConfig => {
          if (!testConfig.tests || testConfig.tests === []) {
            return testConfig;
          }
          testConfig.tests = testConfig.tests.slice(0, -1);
          return testConfig;
        })
      };
    });
  }

  render() {
    const {
      pipelines,
      anyTouched,
      submitting,
      handleSubmit,
      hasFailed = false,
      hasSucceeded = false,
      invalid
    } = this.props;
    return (
      <FormBox
        title={
          <FormattedMessage
            id="app.editExercise.editPipelines"
            defaultMessage="Edit pipelines"
          />
        }
        footer={
          <p className="text-center">
            <SubmitButton
              id="editPipelines"
              invalid={invalid}
              submitting={submitting}
              hasSucceeded={hasSucceeded}
              dirty={anyTouched}
              hasFailed={hasFailed}
              handleSubmit={handleSubmit}
              messages={{
                submit: (
                  <FormattedMessage
                    id="app.editPipelines.submit"
                    defaultMessage="Save changes"
                  />
                ),
                submitting: (
                  <FormattedMessage
                    id="app.editPipelines.submitting"
                    defaultMessage="Saving pipelines ..."
                  />
                ),
                success: (
                  <FormattedMessage
                    id="app.editPipelines.success"
                    defaultMessage="Pipelines were saved."
                  />
                )
              }}
            />
          </p>
        }
      >
        <FieldArray
          name="pipelines"
          component={EditPipelines}
          pipelines={pipelines}
        />
      </FormBox>
    );
  }
}

EditPipelinesForm.propTypes = {
  initialValues: PropTypes.object,
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  pipelines: PropTypes.array.isRequired
};

const validate = () => {};

export default reduxForm({
  form: 'editPipelinesForm',
  validate
})(EditPipelinesForm);
