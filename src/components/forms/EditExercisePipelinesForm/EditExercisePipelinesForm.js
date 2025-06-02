import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import FormBox from '../../widgets/FormBox';
import EditExercisePipelinesTable from './EditExercisePipelinesTable.js';
import SubmitButton from '../SubmitButton';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import { RefreshIcon } from '../../icons';
import { createIndex } from '../../../helpers/common.js';

class EditExercisePipelinesForm extends Component {
  render() {
    const {
      pipelines,
      readOnly = false,
      dirty,
      submitting,
      reset,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid,
      error,
      warning,
    } = this.props;

    return (
      <FormBox
        title={<FormattedMessage id="app.editExercisePipelines.title" defaultMessage="Selected Pipelines" />}
        type={submitSucceeded ? 'success' : undefined}
        noPadding
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
                id="editExercisePipelines"
                invalid={invalid}
                submitting={submitting}
                hasSucceeded={submitSucceeded}
                dirty={dirty}
                hasFailed={submitFailed}
                handleSubmit={handleSubmit}
              />
            </TheButtonGroup>
          </div>
        }>
        <FieldArray name="pipelines" component={EditExercisePipelinesTable} pipelines={pipelines} readOnly={readOnly} />

        {submitFailed && (
          <Callout variant="danger" className="m-3">
            <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
          </Callout>
        )}

        {error && (
          <Callout variant="danger" className="m-3">
            {error}
          </Callout>
        )}

        {warning && (
          <Callout variant="warning" className="m-3">
            {warning}
          </Callout>
        )}
      </FormBox>
    );
  }
}

EditExercisePipelinesForm.propTypes = {
  pipelines: PropTypes.array,
  readOnly: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  error: PropTypes.any,
  warning: PropTypes.any,
};

const validate = ({ pipelines }) => {
  const errors = {};
  if (!pipelines) {
    return errors;
  }

  if (pipelines.length === 0) {
    errors._error = (
      <FormattedMessage
        id="app.editExercisePipelinesForm.validation.noPipelines"
        defaultMessage="There are no pipelines selected."
      />
    );
  }
  return errors;
};

const warn = ({ pipelines }) => {
  const warnings = {};
  if (!pipelines) {
    return warnings;
  }
  const index = createIndex(pipelines);

  if (pipelines.length !== Object.keys(index).length) {
    warnings._warning = (
      <FormattedMessage
        id="app.editExercisePipelinesForm.validation.duplicatePipelineWarning"
        defaultMessage="Some pipelines are selected multiple times. Although such configuration is possible, it is very uncommon. Make sure you have selected the right pipelines."
      />
    );
  }
  return warnings;
};

export default reduxForm({
  form: 'editExercisePipelines',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
  warn,
})(EditExercisePipelinesForm);
