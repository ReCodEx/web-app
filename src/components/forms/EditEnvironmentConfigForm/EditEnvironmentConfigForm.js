import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';

import EditEnvironmentConfigVariables from './EditEnvironmentConfigVariables.js';
import FormBox from '../../widgets/FormBox';
import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import { InfoIcon, RefreshIcon } from '../../icons';
import { compareVariablesForEquality } from '../../../helpers/exercise/environments.js';
import { safeGet, safeSet } from '../../../helpers/common.js';

class EditEnvironmentConfigForm extends Component {
  setDefaultVariables = () => {
    const { defaultVariables = null, change } = this.props;
    if (defaultVariables) {
      change('variables', defaultVariables);
    }
  };

  render() {
    const {
      runtimeEnvironments,
      possibleVariables = null,
      firstTimeSelection = false,
      selectedRuntimeId,
      hasDefaultVariables,
      dirty,
      reset,
      submitting,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid,
      error,
      warning,
      intl: { locale },
    } = this.props;

    return (
      <FormBox
        id="runtimes-form"
        title={
          <FormattedMessage id="app.editEnvironmentConfig.title" defaultMessage="Runtime Environment Configuration" />
        }
        type={submitSucceeded ? 'success' : undefined}
        footer={
          <div className="text-center">
            <TheButtonGroup>
              {dirty && (
                <Button type="reset" onClick={reset} variant="danger">
                  <RefreshIcon gapRight={2} />
                  <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                </Button>
              )}

              <SubmitButton
                id="editRuntimeConfig"
                invalid={invalid}
                submitting={submitting}
                hasSucceeded={submitSucceeded}
                dirty={dirty}
                hasFailed={submitFailed}
                handleSubmit={handleSubmit}
              />

              {Boolean(selectedRuntimeId) && !hasDefaultVariables && (
                <Button onClick={this.setDefaultVariables} variant="primary">
                  <RefreshIcon gapRight={2} />
                  <FormattedMessage
                    id="app.editEnvironmentConfig.setDefaultVariables"
                    defaultMessage="Set Default Variables"
                  />
                </Button>
              )}
            </TheButtonGroup>
          </div>
        }>
        {possibleVariables && (
          <datalist id="editEnvironmentConfigVariablesNames">
            {Object.keys(possibleVariables).map(name => (
              <option key={name}>{name}</option>
            ))}
          </datalist>
        )}

        <p className="text-body-secondary small px-3">
          <InfoIcon gapRight={2} />
          <FormattedMessage
            id="app.editEnvironmentConfig.selectedRuntimeInfo"
            defaultMessage="In the advanced configuration, selected runtime environment is used only to ensure that the backend worker has necessary compilers, tools, or libraries required by the environment. Everything else (source files patterns, pipelines) is configured separately."
          />
        </p>
        <Field
          name="environmentId"
          component={SelectField}
          label={
            <FormattedMessage
              id="app.editEnvironmentConfig.selectedRuntime"
              defaultMessage="Selected Runtime Environment:"
            />
          }
          options={runtimeEnvironments
            .map(({ id, longName }) => ({
              key: id,
              name: longName,
            }))
            .sort((a, b) => a.name.localeCompare(b.name, locale))}
          addEmptyOption={firstTimeSelection}
        />

        {Boolean(selectedRuntimeId) && (
          <>
            <p className="text-body-secondary small px-3">
              <InfoIcon gapRight={2} />
              <FormattedMessage
                id="app.editEnvironmentConfig.variablesInfo"
                defaultMessage="These variables cover the submitted files and how they are associated with pipeline inputs. Each value may hold a file name or a wildcard (e.g., <code>solution.cpp</code>, <code>*.py</code>, <code>my-*.[c,h]</code>). Only <code>file</code> and <code>file[]</code> variables are allowed here."
                values={{
                  code: text => <code>{text}</code>,
                }}
              />
            </p>
            <FieldArray name="variables" component={EditEnvironmentConfigVariables} />
          </>
        )}

        {!selectedRuntimeId && (
          <Callout variant="warning" className="mt-3">
            <FormattedMessage
              id="app.editEnvironmentConfig.noRuntimeSelected"
              defaultMessage="There must be a runtime environment selected before you can proceed with exercise configuration."
            />
          </Callout>
        )}

        {submitFailed && (
          <Callout variant="danger" className="mt-3">
            <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
          </Callout>
        )}

        {error && (
          <Callout variant="danger" className="mt-3">
            {error}
          </Callout>
        )}

        {warning && (
          <Callout variant="warning" className="mt-3">
            {warning}
          </Callout>
        )}
      </FormBox>
    );
  }
}

EditEnvironmentConfigForm.propTypes = {
  selectedPipelines: PropTypes.array,
  runtimeEnvironments: PropTypes.array.isRequired,
  possibleVariables: PropTypes.object,
  firstTimeSelection: PropTypes.bool,
  readOnly: PropTypes.bool,
  selectedRuntimeId: PropTypes.string,
  defaultVariables: PropTypes.array,
  hasDefaultVariables: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  error: PropTypes.any,
  warning: PropTypes.any,
  intl: PropTypes.object.isRequired,
};

const validate = ({ environmentId, variables }) => {
  const errors = {};
  if (!variables) {
    return errors;
  }

  if (!environmentId) {
    errors.environmentId = (
      <FormattedMessage
        id="app.editEnvironmentConfig.validateEnvironment"
        defaultMessage="A runtime environment must be selected."
      />
    );
  }

  // Check variable names.
  const index = {};
  variables.forEach(({ name }, idx) => {
    if (!name || !name.match(/^[-a-zA-Z0-9_]+$/)) {
      safeSet(
        errors,
        ['variables', idx, 'name'],
        <FormattedMessage
          id="app.editEnvironmentConfig.validateName"
          defaultMessage="This is not a valid variable name."
        />
      );
    } else {
      if (!index[name]) {
        index[name] = [];
      }
      index[name].push(idx);
    }
  });

  // Check variable name duplicities
  Object.keys(index).forEach(name => {
    if (index[name].length > 1) {
      index[name].forEach(idx =>
        safeSet(
          errors,
          ['variables', idx, 'name'],
          <FormattedMessage
            id="app.editEnvironmentConfig.duplicateVariable"
            defaultMessage="Duplicate variable name."
          />
        )
      );
    }
  });

  return errors;
};

const warn = ({ variables }, { possibleVariables = null }) => {
  const warnings = {};
  if (!variables) {
    return warnings;
  }

  if (possibleVariables) {
    variables
      .filter(({ name }) => name && name.match(/^[-a-zA-Z0-9_]+$/))
      .forEach(({ name }, idx) => {
        if (!possibleVariables[name]) {
          safeSet(
            warnings,
            ['variables', idx, 'name'],
            <FormattedMessage
              id="app.editEnvironmentConfig.warnings.unknownVariable"
              defaultMessage="This variable is not defined in any pipeline."
            />
          );
        } else if (possibleVariables[name] > 1) {
          safeSet(
            warnings,
            ['variables', idx, 'name'],
            <FormattedMessage
              id="app.editEnvironmentConfig.warnings.ambiguousVariable"
              defaultMessage="This variable is defined in multiple pipelines. The value will be used in all of them."
            />
          );
        }
      });
  } else {
    warnings._warning = (
      <FormattedMessage
        id="app.editEnvironmentConfig.warnings.noPipelinesVariables"
        defaultMessage="There are no pipelines set. Name of the variables may not be verified."
      />
    );
  }

  return warnings;
};

export default connect((state, { runtimeEnvironments }) => {
  const values = getFormValues('editEnvironmentConfig')(state);
  const selectedRuntimeId = values && values.environmentId;
  const defaultVariables = selectedRuntimeId
    ? safeGet(runtimeEnvironments, [({ id }) => id === selectedRuntimeId, 'defaultVariables'])
    : null;

  return {
    selectedRuntimeId,
    defaultVariables,
    hasDefaultVariables: Boolean(defaultVariables) && compareVariablesForEquality(values.variables, defaultVariables),
  };
})(
  reduxForm({
    form: 'editEnvironmentConfig',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    validate,
    warn,
  })(injectIntl(EditEnvironmentConfigForm))
);
