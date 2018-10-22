import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, FieldArray, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert, Button } from 'react-bootstrap';
import Box from '../../../components/widgets/Box';

import SubmitButton from '../SubmitButton';
import EditExerciseConfigEnvironment from './EditExerciseConfigEnvironment';
import { fetchSupplementaryFilesForExercise } from '../../../redux/modules/supplementaryFiles';
import { getSupplementaryFilesForExercise } from '../../../redux/selectors/supplementaryFiles';
import { getVariablesForPipelines } from '../../../redux/modules/exercises';
import { AddIcon, RemoveIcon } from '../../icons';

class EditExerciseConfigForm extends Component {
  state = { testConfigs: [] };

  componentDidMount() {
    const { initialValues, fetchFiles } = this.props;
    this.setState({ testConfigs: initialValues.config });
    fetchFiles();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.exercise.id !== newProps.exercise.id) {
      this.setState({ testConfigs: newProps.initialValues.config });
      newProps.fetchFiles();
    }
  }

  addTest() {
    this.setState((prevState, props) => {
      return {
        testConfigs: prevState.testConfigs.map(testConfig => {
          if (!testConfig.tests) {
            testConfig.tests = [];
          }
          testConfig.tests.push({
            name: 'Test ' + (testConfig.tests.length + 1)
          });
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

  getTestPipelinesVariables(runtimeEnvironmentIndex, testIndex) {
    const { formValues, fetchVariables, change } = this.props;

    // prepare request data
    const formPipelines =
      formValues.config[runtimeEnvironmentIndex].tests[testIndex].pipelines;
    var pipelines = [];
    var firstSkipped = false;
    if (
      formPipelines[0] &&
      formPipelines[0].name &&
      formPipelines[0].name !== ''
    ) {
      pipelines.push(formPipelines[0].name);
    } else {
      firstSkipped = true;
    }
    if (
      formPipelines[1] &&
      formPipelines[1].name &&
      formPipelines[1].name !== ''
    ) {
      pipelines.push(formPipelines[1].name);
    }

    if (pipelines.length > 0) {
      // perform the API request
      fetchVariables(
        this.state.testConfigs[runtimeEnvironmentIndex].name,
        pipelines
      )
        .then(res => res.value)
        .then(data => {
          var newPipelines = [];
          if (firstSkipped) {
            newPipelines.push({ name: '', variables: [] });
          }
          const pipelineKeys = Object.keys(data);
          for (
            var pipelineIndex = 0;
            pipelineIndex < pipelineKeys.length;
            pipelineIndex++
          ) {
            // prepare pipelines and variables from response
            const pipelineName = pipelineKeys[pipelineIndex];
            newPipelines.push({
              name: pipelineName,
              variables: data[pipelineName]
            });
            // clear previous variables from form (those which will not get overwritten)
            if (
              data[pipelineName].length < formPipelines[pipelineIndex].variables
                ? formPipelines[pipelineIndex].variables.length
                : 0
            ) {
              change(
                `config[${runtimeEnvironmentIndex}][tests][${testIndex}][pipelines][${pipelineIndex}][variables]`,
                ''
              );
            }
            // set name and type into form for each variable
            for (
              var variableIndex = 0;
              variableIndex < data[pipelineName].length;
              variableIndex++
            ) {
              change(
                `config[${runtimeEnvironmentIndex}][tests][${testIndex}][pipelines][${pipelineIndex}][variables][${variableIndex}][name]`,
                data[pipelineName][variableIndex].name
              );
              change(
                `config[${runtimeEnvironmentIndex}][tests][${testIndex}][pipelines][${pipelineIndex}][variables][${variableIndex}][type]`,
                data[pipelineName][variableIndex].type
              );
            }
          }

          // save new variables into state
          this.setState((prevState, props) => {
            var newTestConfigs = prevState.testConfigs;
            newTestConfigs[runtimeEnvironmentIndex].tests[
              testIndex
            ].pipelines = newPipelines;
            return {
              testConfigs: newTestConfigs
            };
          });
        });
    }
  }

  render() {
    const {
      runtimeEnvironments,
      supplementaryFiles,
      pipelines,
      anyTouched,
      submitting,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid
    } = this.props;
    return (
      <Box
        title={
          <FormattedMessage
            id="app.editExercise.editTestConfig"
            defaultMessage="Edit configurations"
          />
        }
        unlimitedHeight
      >
        <div>
          {submitFailed &&
            <Alert bsStyle="danger">
              <FormattedMessage
                id="generic.savingFailed"
                defaultMessage="Saving failed. Please try again later."
              />
            </Alert>}

          <FieldArray
            name="config"
            component={EditExerciseConfigEnvironment}
            testConfigs={this.state.testConfigs}
            runtimeEnvironments={runtimeEnvironments}
            supplementaryFiles={supplementaryFiles}
            pipelines={pipelines}
            fetchVariables={(runtimeEnvironmentIndex, testIndex) =>
              this.getTestPipelinesVariables(
                runtimeEnvironmentIndex,
                testIndex
              )}
          />

          <p className="text-center">
            <SubmitButton
              id="editExerciseConfig"
              invalid={invalid}
              submitting={submitting}
              hasSucceeded={submitSucceeded}
              dirty={anyTouched}
              hasFailed={submitFailed}
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
                    defaultMessage="Saving configuration..."
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
              bsStyle={'primary'}
              className="btn-flat"
            >
              <AddIcon gapRight />
              <FormattedMessage
                id="app.editExerciseConfigForm.addTest"
                defaultMessage="Add new test"
              />
            </Button>
            <Button
              onClick={() => this.removeLastTest()}
              bsStyle={'danger'}
              className="btn-flat"
            >
              <RemoveIcon gapRight />
              <FormattedMessage
                id="app.editExerciseConfigForm.removeLastTest"
                defaultMessage="Remove last test"
              />
            </Button>
          </p>
        </div>
      </Box>
    );
  }
}

EditExerciseConfigForm.propTypes = {
  initialValues: PropTypes.object,
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  runtimeEnvironments: PropTypes.array.isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  fetchFiles: PropTypes.func.isRequired,
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired
  }),
  pipelines: ImmutablePropTypes.map,
  formValues: PropTypes.object,
  fetchVariables: PropTypes.func,
  change: PropTypes.func
};

const validate = ({ config }) => {
  const errors = {};
  errors['config'] = {};

  if (config.length < 2) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editExerciseConfigForm.validation.noEnvironments"
        defaultMessage="Please add at least one environment config for the exercise."
      />
    );
  }

  for (let i = 0; i < config.length; i++) {
    const envErrors = {};

    envErrors['tests'] = {};
    for (let j = 0; j < config[i].tests.length; j++) {
      const testErrors = {};

      if (
        config[i].tests[j].pipelines &&
        config[i].tests[j].pipelines[0] &&
        config[i].tests[j].pipelines[1] &&
        config[i].tests[j].pipelines[0].name !== '' &&
        config[i].tests[j].pipelines[1].name !== '' &&
        config[i].tests[j].pipelines[0].name ===
          config[i].tests[j].pipelines[1].name
      ) {
        const pipelineErrors = {};
        pipelineErrors['name'] = (
          <FormattedMessage
            id="app.editExerciseConfigForm.validation.duplicatePipeline"
            defaultMessage="Please select a different pipeline."
          />
        );
        testErrors['pipelines'] = {};
        testErrors['pipelines'][1] = pipelineErrors;
      }

      envErrors['tests'][j] = testErrors;
    }

    errors['config'][i] = envErrors;
  }

  return errors;
};

const ConnectedEditExerciseConfigForm = connect(
  (state, { exercise }) => {
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(exercise.id)(state),
      formValues: getFormValues('editExerciseConfig')(state)
    };
  },
  (dispatch, { exercise }) => ({
    fetchFiles: () => dispatch(fetchSupplementaryFilesForExercise(exercise.id)),
    fetchVariables: (runtimeEnvironmentIndex, testIndex) =>
      dispatch(
        getVariablesForPipelines(
          exercise.id,
          runtimeEnvironmentIndex,
          testIndex
        )
      )
  })
)(EditExerciseConfigForm);

export default reduxForm({
  form: 'editExerciseConfig',
  validate
})(ConnectedEditExerciseConfigForm);
