import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import {
  FormattedMessage,
  FormattedHTMLMessage,
  intlShape,
  injectIntl
} from 'react-intl';
import { Alert } from 'react-bootstrap';

import EditEnvironmentConfigVariables from './EditEnvironmentConfigVariables';
import FormBox from '../../widgets/FormBox';
import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button from '../../widgets/FlatButton';
import { InfoIcon, RefreshIcon } from '../../icons';
import { compareVariablesForEquality } from '../../../helpers/exercise/environments';
import { safeGet, safeSet } from '../../../helpers/common';

class EditEnvironmentConfigForm extends Component {
  setDefaultVariables = () => {
    const { defaultVariables = null, change } = this.props;
    if (defaultVariables) {
      change(
        'variables',
        defaultVariables.map(({ name, value }) => ({ name, value }))
      );
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
      intl: { locale }
    } = this.props;

    return (
      <FormBox
        title={
          <FormattedMessage
            id="app.editEnvironmentConfig.title"
            defaultMessage="Runtime Environment Configuration"
          />
        }
        type={submitSucceeded ? 'success' : undefined}
        footer={
          <div className="text-center">
            {dirty &&
              <Button type="reset" onClick={reset} bsStyle="danger">
                <RefreshIcon gapRight />
                <FormattedMessage id="generic.reset" defaultMessage="Reset" />
              </Button>}

            <SubmitButton
              id="editRuntimeConfig"
              invalid={invalid}
              submitting={submitting}
              hasSucceeded={submitSucceeded}
              dirty={dirty}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
            />

            {Boolean(selectedRuntimeId) &&
              !hasDefaultVariables &&
              <Button onClick={this.setDefaultVariables} bsStyle="primary">
                <RefreshIcon gapRight />
                <FormattedMessage
                  id="app.editEnvironmentConfig.setDefaultVariables"
                  defaultMessage="Set Default Variables"
                />
              </Button>}
          </div>
        }
      >
        {possibleVariables &&
          <datalist id="editEnvironmentConfigVariablesNames">
            {Object.keys(possibleVariables).map(name =>
              <option key={name}>
                {name}
              </option>
            )}
          </datalist>}

        <p className="text-muted small em-padding-horizontal">
          <InfoIcon gapRight />
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
              name: longName
            }))
            .sort((a, b) => a.name.localeCompare(b.name, locale))}
          addEmptyOption={firstTimeSelection}
        />

        {Boolean(selectedRuntimeId) &&
          <React.Fragment>
            <p className="text-muted small em-padding-horizontal">
              <InfoIcon gapRight />
              <FormattedHTMLMessage
                id="app.editEnvironmentConfig.variablesInfo"
                defaultMessage="These variables cover the submitted files and how they are associated with pipeline inputs. Each value may hold a file name or a wildcard (e.g., <code>solution.cpp</code>, <code>*.py</code>, <code>my-*.\{c,h\}</code>). Only variables of type <code>file[]</code> are allowed here."
              />
            </p>
            <FieldArray
              name="variables"
              component={EditEnvironmentConfigVariables}
              leftLabel={
                <FormattedMessage
                  id="app.editEnvironmentConfig.variableName"
                  defaultMessage="Source Files Variable:"
                />
              }
              rightLabel={
                <FormattedMessage
                  id="app.editEnvironmentConfig.variableValue"
                  defaultMessage="Wildcard Pattern:"
                />
              }
            />
          </React.Fragment>}

        {!selectedRuntimeId &&
          <Alert bsStyle="warning" className="em-margin-top">
            <FormattedMessage
              id="app.editEnvironmentConfig.noRuntimeSelected"
              defaultMessage="There must be a runtime environment selected before you can proceed with exercise configuration."
            />
          </Alert>}

        {submitFailed &&
          <Alert bsStyle="danger" className="em-margin-top">
            <FormattedMessage
              id="generic.savingFailed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        {error &&
          <Alert bsStyle="danger" className="em-margin-top">
            {error}
          </Alert>}

        {warning &&
          <Alert bsStyle="warning" className="em-margin-top">
            {warning}
          </Alert>}
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
  intl: intlShape.isRequired
};

const validate = ({ environmentId, variables }) => {
  const errors = {};

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
    ? safeGet(runtimeEnvironments, [
        ({ id }) => id === selectedRuntimeId,
        'defaultVariables'
      ])
    : null;

  return {
    selectedRuntimeId,
    defaultVariables,
    hasDefaultVariables:
      Boolean(defaultVariables) &&
      compareVariablesForEquality(values.variables, defaultVariables)
  };
})(
  reduxForm({
    form: 'editEnvironmentConfig',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    validate,
    warn
  })(injectIntl(EditEnvironmentConfigForm))
);
