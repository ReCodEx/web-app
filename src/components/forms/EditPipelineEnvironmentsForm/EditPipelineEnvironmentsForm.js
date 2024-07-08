import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import EditEnvironmentList from '../EditEnvironmentSimpleForm/EditEnvironmentList.js';
import { SaveIcon } from '../../icons';
import Callout from '../../widgets/Callout';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';

class EditPipelineEnvironmentsForm extends Component {
  render() {
    const { runtimeEnvironments, dirty, submitting, handleSubmit, submitFailed, submitSucceeded, invalid } = this.props;
    return (
      <FormBox
        title={
          <FormattedMessage
            id="app.editPipelineEnvironmentsForm.title"
            defaultMessage="Pipeline Runtime Environments"
          />
        }
        succeeded={submitSucceeded}
        dirty={dirty}
        footer={
          <div className="text-center">
            <SubmitButton
              id="editPipelineEnvironments"
              invalid={invalid}
              submitting={submitting}
              dirty={dirty}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
              defaultIcon={<SaveIcon gapRight />}
              messages={{
                submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
                submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
                success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
              }}
            />
          </div>
        }>
        {submitFailed && (
          <Callout variant="danger">
            <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
          </Callout>
        )}

        <EditEnvironmentList runtimeEnvironments={runtimeEnvironments} />
      </FormBox>
    );
  }
}

EditPipelineEnvironmentsForm.propTypes = {
  runtimeEnvironments: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
};

export default reduxForm({
  form: 'editPipelineEnvironments',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(EditPipelineEnvironmentsForm);
