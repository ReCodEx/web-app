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
      environmentFormValues: { environmentConfigs = [] } = {},
      runtimeEnvironments = [],
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
          name="runtimeConfigs"
          component={EditEnvironmentConfigTabs}
          environmentConfigs={environmentConfigs}
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
  initialValues: PropTypes.object,
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  environmentFormValues: PropTypes.shape({
    environmentConfigs: PropTypes.array
  }),
  runtimeEnvironments: PropTypes.object
};

const validate = () => {};

export default reduxForm({
  form: 'editEnvironmentConfig',
  validate
})(EditEnvironmentConfigForm);
