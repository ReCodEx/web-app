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
import { safeGet } from '../../../helpers/common';

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
        <p className="text-muted small em-padding-horizontal">
          <InfoIcon gapRight />
          <FormattedMessage
            id="app.editEnvironmentConfig.selectedRuntimeInfo"
            defaultMessage="In the advanced configuration, selected runtime environemnt is used only to ensure that the backend worker has necessary compilers, tools, or libraries required by the environment. Everything else (source files patterns, pipelines) is configured separately."
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
          <Alert bsStyle="warning">
            <FormattedMessage
              id="app.editEnvironmentConfig.noRuntimeSelected"
              defaultMessage="There must be a runtime environment selected before you can proceed with exercise configuration."
            />
          </Alert>}

        {submitFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="generic.savingFailed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        {error &&
          <Alert bsStyle="danger">
            {error}
          </Alert>}
      </FormBox>
    );
  }
}

EditEnvironmentConfigForm.propTypes = {
  selectedPipelines: PropTypes.array,
  runtimeEnvironments: PropTypes.array.isRequired,
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
  intl: intlShape.isRequired
};

const warn = formData => {
  const warnings = {};
  // TODO -- complete validation against pipeline variables, warn if variable does not exist.
  return warnings;
};

export default connect((state, { runtimeEnvironments }) => {
  const values = getFormValues('editEnvironmentConfig')(state);
  const selectedRuntimeId = values && values.environmentId;
  const defaultVariables =
    selectedRuntimeId &&
    safeGet(runtimeEnvironments, [
      ({ id }) => id === selectedRuntimeId,
      'defaultVariables'
    ]);

  return {
    selectedRuntimeId,
    defaultVariables,
    hasDefaultVariables:
      defaultVariables &&
      compareVariablesForEquality(values.variables, defaultVariables)
  };
})(
  reduxForm({
    form: 'editEnvironmentConfig',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    warn
  })(injectIntl(EditEnvironmentConfigForm))
);
