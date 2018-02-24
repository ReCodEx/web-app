import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import SubmitButton from '../SubmitButton';
import EditEnvironmentConfigTabs from './EditEnvironmentConfigTabs';

class EditEnvironmentConfigForm extends Component {
  fillDefaultVariablesIfNeeded(index) {
    const { formValues, runtimeEnvironments } = this.props;

    const envId =
      formValues &&
      formValues.environmentConfigs &&
      formValues.environmentConfigs[index] &&
      formValues.environmentConfigs[index].runtimeEnvironmentId
        ? formValues.environmentConfigs[index].runtimeEnvironmentId
        : '';
    let currentVariables =
      formValues &&
      formValues.environmentConfigs &&
      formValues.environmentConfigs[index] &&
      formValues.environmentConfigs[index].variablesTable
        ? formValues.environmentConfigs[index].variablesTable
        : [];

    const environment =
      runtimeEnvironments &&
      runtimeEnvironments.toJS()[envId] &&
      runtimeEnvironments.toJS()[envId]
        ? runtimeEnvironments.toJS()[envId].data
        : {};
    const envDefaults = environment.defaultVariables
      ? environment.defaultVariables
      : [];

    for (const envVariable of envDefaults) {
      let isPresent = false;
      for (const curVariable of currentVariables) {
        if (curVariable.name === envVariable.name) {
          isPresent = true;
        }
      }

      if (!isPresent) {
        currentVariables.push(envVariable);
      }
    }
  }

  render() {
    const {
      runtimeEnvironments = [],
      environmentFormValues: { environmentConfigs = [] } = {},
      anyTouched,
      submitting,
      handleSubmit,
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
              id="app.editEnvironmentConfigForm.failed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        <FieldArray
          name="environmentConfigs"
          component={EditEnvironmentConfigTabs}
          environmentValues={environmentConfigs}
          runtimeEnvironments={runtimeEnvironments}
          formValues={formValues}
          fillDefaultVariablesIfNeeded={i =>
            this.fillDefaultVariablesIfNeeded(i)}
        />

        <div className="text-center">
          <SubmitButton
            id="editEnvironmentConfig"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={submitSucceeded}
            dirty={anyTouched}
            hasFailed={submitFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.editEnvironmentConfigForm.submit"
                  defaultMessage="Change configuration"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editEnvironmentConfigForm.submitting"
                  defaultMessage="Saving configuration ..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editEnvironmentConfigForm.success"
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

EditEnvironmentConfigForm.propTypes = {
  environmentFormValues: PropTypes.object,
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  runtimeEnvironments: PropTypes.object,
  formValues: PropTypes.object
};

const validate = ({ environmentConfigs }) => {
  const errors = {};

  if (environmentConfigs.length < 1) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editEnvironmentConfigForm.validation.noEnvironments"
        defaultMessage="Please add at least one environment config for the exercise."
      />
    );
  }

  const environmentConfigsErrors = {};
  for (let i = 0; i < environmentConfigs.length; ++i) {
    const environmentErrors = {};
    if (!environmentConfigs[i]) {
      environmentErrors['runtimeEnvironmentId'] = (
        <FormattedMessage
          id="app.editEnvironmentConfigForm.validation.environments"
          defaultMessage="Please fill environment information."
        />
      );
    } else {
      if (!environmentConfigs[i].runtimeEnvironmentId) {
        environmentErrors['runtimeEnvironmentId'] = (
          <FormattedMessage
            id="app.editEnvironmentConfigForm.validation.environments.runtime"
            defaultMessage="Please select the runtime environment."
          />
        );
      }
    }

    const variablesErrors = {};
    const variables = environmentConfigs[i]
      ? environmentConfigs[i].variablesTable
      : [];
    for (let j = 0; j < variables.length; ++j) {
      const variableErrors = {};
      if (!variables[j]) {
        variableErrors['name'] = (
          <FormattedMessage
            id="app.editEnvironmentConfigForm.validation.environments.variableNameType"
            defaultMessage="Please specify variable name, type and value."
          />
        );
      }
      if (variables[j] && !variables[j].name) {
        variableErrors['name'] = (
          <FormattedMessage
            id="app.editEnvironmentConfigForm.validation.environments.variableName"
            defaultMessage="Please specify variable name."
          />
        );
      }
      if (variables[j] && !variables[j].type) {
        variableErrors['type'] = (
          <FormattedMessage
            id="app.editEnvironmentConfigForm.validation.environments.variableType"
            defaultMessage="Please specify variable type."
          />
        );
      }
      if (variables[j] && !variables[j].value) {
        variableErrors['value'] = (
          <FormattedMessage
            id="app.editEnvironmentConfigForm.validation.environments.variableValue"
            defaultMessage="Please specify variable value."
          />
        );
      }
      variablesErrors[j] = variableErrors;
    }
    environmentErrors['variablesTable'] = variablesErrors;

    environmentConfigsErrors[i] = environmentErrors;
  }

  const environmentArr = environmentConfigs
    .filter(config => config !== undefined)
    .map(config => config.runtimeEnvironmentId);
  for (let i = 0; i < environmentArr.length; ++i) {
    if (environmentArr.indexOf(environmentArr[i]) !== i) {
      if (!environmentConfigsErrors[i].runtimeEnvironmentId) {
        environmentConfigsErrors[i].runtimeEnvironmentId = (
          <FormattedMessage
            id="app.editEnvironmentConfigForm.validation.sameEnvironments"
            defaultMessage="There are more environment specifications for the same environment. Please make sure environments are unique."
          />
        );
      }
    }
  }

  errors['environmentConfigs'] = environmentConfigsErrors;

  return errors;
};

export default connect(state => {
  return {
    formValues: getFormValues('editEnvironmentConfig')(state)
  };
})(
  reduxForm({
    form: 'editEnvironmentConfig',
    validate
  })(EditEnvironmentConfigForm)
);
