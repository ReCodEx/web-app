import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, FieldArray, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import EditExerciseSimpleConfigEnvironment from './EditExerciseSiimpleConfigEnvironment';
import SubmitButton from '../SubmitButton';

class EditExerciseSimpleConfigForm extends Component {
  render() {
    const {
      anyTouched,
      submitting,
      handleSubmit,
      hasFailed = false,
      hasSucceeded = false,
      invalid,
      runtimeEnvironments,
      formValues
    } = this.props;
    return (
      <div>
        {hasFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="app.editExerciseConfigForm.failed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        <FieldArray
          name="config"
          component={EditExerciseSimpleConfigEnvironment}
          runtimeEnvironments={runtimeEnvironments}
          formValues={formValues}
        />

        <p className="text-center">
          <SubmitButton
            id="editExerciseSimpleConfig"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={hasSucceeded}
            dirty={anyTouched}
            hasFailed={hasFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.editExerciseSimpleConfigForm.submit"
                  defaultMessage="Change configuration"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editExerciseSimpleConfigForm.submitting"
                  defaultMessage="Saving configuration ..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editExerciseSimpleConfigForm.success"
                  defaultMessage="Configuration was changed."
                />
              )
            }}
          />
        </p>
      </div>
    );
  }
}

EditExerciseSimpleConfigForm.propTypes = {
  initialValues: PropTypes.object,
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired
  }),
  formValues: PropTypes.object,
  runtimeEnvironments: ImmutablePropTypes.map
};

const validate = () => {
  const errors = {};

  return errors;
};

export default connect((state, { exercise }) => {
  return {
    formValues: getFormValues('editExerciseSimpleConfig')(state)
  };
})(
  reduxForm({
    form: 'editExerciseSimpleConfig',
    validate
  })(EditExerciseSimpleConfigForm)
);
