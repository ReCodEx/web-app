import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Alert, Well } from 'react-bootstrap';

import EditEnvironmentList from './EditEnvironmentList';
import SubmitButton from '../SubmitButton';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import { STANDALONE_ENVIRONMENTS } from '../../../helpers/exercise/environments';
import { getConfigVar } from '../../../helpers/config';

const environmentsHelpUrl = getConfigVar('ENVIRONMENTS_INFO_URL');

class EditEnvironmentSimpleForm extends Component {
  render() {
    const {
      dirty,
      submitting,
      reset,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid,
      error,
      runtimeEnvironments,
    } = this.props;

    return (
      <div>
        {environmentsHelpUrl && (
          <Well bsSize="sm">
            <div className="small text-muted">
              <FormattedHTMLMessage
                id="app.editEnvironmentSimpleForm.linkToWiki"
                defaultMessage="Select all runtime environments the exercise should support. You may find more information about the environments at our <a href='{url}' target='_blank'>wiki page</a>."
                values={{ url: environmentsHelpUrl }}
              />
            </div>
          </Well>
        )}

        <EditEnvironmentList runtimeEnvironments={runtimeEnvironments} showExclusive />

        <hr />

        {submitFailed && (
          <Alert bsStyle="danger">
            <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
          </Alert>
        )}

        {error && <Alert bsStyle="danger">{error}</Alert>}

        <div className="text-center">
          {dirty && (
            <span>
              <Button type="reset" onClick={reset} bsStyle={'danger'} className="btn-flat">
                <RefreshIcon gapRight />
                <FormattedMessage id="generic.reset" defaultMessage="Reset" />
              </Button>{' '}
            </span>
          )}

          <SubmitButton
            id="editTests"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={submitSucceeded}
            dirty={dirty}
            hasFailed={submitFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: <FormattedMessage id="app.editEnvironmentSimpleForm.submit" defaultMessage="Save Environments" />,
              submitting: (
                <FormattedMessage
                  id="app.editEnvironmentSimpleForm.submitting"
                  defaultMessage="Saving Environments..."
                />
              ),
              success: (
                <FormattedMessage id="app.editEnvironmentSimpleForm.success" defaultMessage="Environments Saved." />
              ),
            }}
          />
        </div>
      </div>
    );
  }
}

EditEnvironmentSimpleForm.propTypes = {
  values: PropTypes.array,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  error: PropTypes.any,
  runtimeEnvironments: PropTypes.array,
};

const validate = (formData, { runtimeEnvironments }) => {
  const errors = {};
  if (Object.values(formData).length === 0 || runtimeEnvironments.length === 0) {
    return errors; // This is actually a hack (reduxForm fails to re-validate after re-initialization)
  }

  const allowedEnvrionmentsCount = Object.values(formData).filter(value => value === true || value === 'true').length;
  if (allowedEnvrionmentsCount === 0) {
    errors._error = (
      <FormattedMessage
        id="app.editEnvironmentSimpleForm.validation.environments"
        defaultMessage="Please add at least one runtime environment."
      />
    );
  } else if (allowedEnvrionmentsCount > 1) {
    const standaloneEnvs = STANDALONE_ENVIRONMENTS.filter(envId => formData[envId]).map(envId => {
      const env = runtimeEnvironments.find(({ id }) => id === envId);
      return env && env.name;
    });

    if (standaloneEnvs.length > 0) {
      errors._error = (
        <FormattedMessage
          id="app.editEnvironmentSimpleForm.validation.standaloneEnvironmentsCollisions"
          defaultMessage="Some of the selected environments ({envs}) cannot be combined with any other environment. You need to deselect these environment(s) or make sure only one environment is selected."
          values={{ envs: standaloneEnvs.join(', ') }}
        />
      );
    }
  }

  return errors;
};

export default reduxForm({
  form: 'editEnvironmentSimple',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(EditEnvironmentSimpleForm);
