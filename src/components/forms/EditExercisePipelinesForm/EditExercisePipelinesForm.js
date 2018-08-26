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
      error
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
            {dirty &&
              <span>
                <Button
                  type="reset"
                  onClick={reset}
                  bsStyle={'danger'}
                  className="btn-flat"
                >
                  <RefreshIcon gapRight />
                  <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                </Button>
              </span>}

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
        }
      >
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

        <FieldArray
          name="pipelines"
          component={EditExercisePipelinesTable}
          pipelines={pipelines}
          readOnly={readOnly}
        />
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
  error: PropTypes.any
};

const validate = formData => {
  const errors = {};
  /*
  const allowedEnvrionmentsCount = Object.values(formData).filter(
    value => value === true || value === 'true'
  ).length;

  if (allowedEnvrionmentsCount === 0) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editEnvironmentSimpleForm.validation.environments"
        defaultMessage="Please add at least one runtime environment."
      />
    );
  } else if (formData['data-linux'] && allowedEnvrionmentsCount > 1) {
    errors['_error'] = (
      <FormattedMessage
        id="app.editEnvironmentSimpleForm.validation.dataOnlyCollision"
        defaultMessage="Data-Only environment cannot be combined with any other environment."
      />
    );
  }
  */
  return errors;
};

export default reduxForm({
  form: 'editExercisePipelines',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate
})(EditExercisePipelinesForm);
