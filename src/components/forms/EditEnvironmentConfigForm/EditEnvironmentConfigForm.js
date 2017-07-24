import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import SubmitButton from '../SubmitButton';
import EditEnvironmentConfigTabs from './EditEnvironmentConfigTabs';

class EditEnvironmentConfigForm extends Component {
  render() {
    const {
      runtimeEnvironments = [],
      environmentFormValues: { environmentConfigs = [] } = {},
      anyTouched,
      submitting,
      handleSubmit,
      hasFailed = false,
      hasSucceeded = false,
      invalid
    } = this.props;

    return (
      <div>
        {hasFailed &&
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
        />

        <div className="text-center">
          <SubmitButton
            id="editEnvironmentConfig"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={hasSucceeded}
            dirty={anyTouched}
            hasFailed={hasFailed}
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
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  runtimeEnvironments: PropTypes.object
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

export default reduxForm({
  form: 'editEnvironmentConfig',
  validate
})(EditEnvironmentConfigForm);
