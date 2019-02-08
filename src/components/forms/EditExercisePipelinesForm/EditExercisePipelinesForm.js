import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import EditExercisePipelinesTable from './EditExercisePipelinesTable';
import SubmitButton from '../SubmitButton';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import { createIndex } from '../../../helpers/common';

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
        title={
          <FormattedMessage
            id="app.editExercisePipelines.title"
            defaultMessage="Selected Pipelines"
          />
        }
        type={submitSucceeded ? 'success' : undefined}
        noPadding
        footer={
          <div className="text-center">
            {dirty && (
              <span>
                <Button
                  type="reset"
                  onClick={reset}
                  bsStyle={'danger'}
                  className="btn-flat">
                  <RefreshIcon gapRight />
                  <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                </Button>
              </span>
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
          </div>
        }>
        <FieldArray
          name="pipelines"
          component={EditExercisePipelinesTable}
          pipelines={pipelines}
          readOnly={readOnly}
        />

        {submitFailed && (
          <Alert bsStyle="danger" className="em-margin">
            <FormattedMessage
              id="generic.savingFailed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>
        )}

        {error && (
          <Alert bsStyle="danger" className="em-margin">
            {error}
          </Alert>
        )}

        {warning && (
          <Alert bsStyle="warning" className="em-margin">
            {warning}
          </Alert>
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
  const index = createIndex(pipelines);

  if (pipelines.length !== Object.keys(index).length) {
    warnings._warning = (
      <FormattedMessage
        id="app.editExercisePipelinesForm.validation.duplicatePipelineWarning"
        defaultMessage="Some pipelines are selected multiple times. Although such configuration is possilbe, it is very uncommon. Make sure you have selected the right pipelines."
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
