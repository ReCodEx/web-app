import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import SubmitButton from '../SubmitButton';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import EditExerciseSimpleConfigTest from './EditExerciseSimpleConfigTest';
import { createGetSupplementaryFiles } from '../../../redux/selectors/supplementaryFiles';
import { encodeTestId } from '../../../redux/modules/simpleLimits';

const EditExerciseSimpleConfigForm = ({
  reset,
  handleSubmit,
  submitting,
  submitFailed,
  submitSucceeded,
  invalid,
  dirty,
  formValues,
  supplementaryFiles,
  exerciseTests
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.editExercise.editConfig"
        defaultMessage="Edit exercise configuration"
      />
    }
    unlimitedHeight
    noPadding
    success={submitSucceeded}
    dirty={dirty}
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
              <RefreshIcon /> &nbsp;
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.reset"
                defaultMessage="Reset"
              />
            </Button>{' '}
          </span>}

        <SubmitButton
          id="editExerciseSimpleConfig"
          invalid={invalid}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          handleSubmit={handleSubmit}
          messages={{
            submit: (
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.submit"
                defaultMessage="Save Configuration"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.submitting"
                defaultMessage="Saving Configuration ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.success"
                defaultMessage="Configuration Saved."
              />
            ),
            validating: (
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.validating"
                defaultMessage="Validating ..."
              />
            )
          }}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.editExerciseConfigForm.failed"
          defaultMessage="Saving failed. Please try again later."
        />
      </Alert>}
    <ResourceRenderer resource={supplementaryFiles.toArray()}>
      {(...files) =>
        <div>
          {exerciseTests.map((test, idx) =>
            <EditExerciseSimpleConfigTest
              key={idx}
              formValues={formValues}
              supplementaryFiles={files}
              testName={test.name}
              test={'config.' + encodeTestId(test.id)}
              testKey={encodeTestId(test.id)}
              testIndex={idx}
              smartFill={() => undefined}
            />
          )}
        </div>}
    </ResourceRenderer>
  </FormBox>;

EditExerciseSimpleConfigForm.propTypes = {
  initialValues: PropTypes.object,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  dirty: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  formValues: PropTypes.object,
  supplementaryFiles: ImmutablePropTypes.map,
  exerciseTests: PropTypes.array
};

export default connect((state, { exercise }) => {
  const getSupplementaryFilesForExercise = createGetSupplementaryFiles(
    exercise.supplementaryFilesIds
  );
  return {
    supplementaryFiles: getSupplementaryFilesForExercise(state),
    formValues: getFormValues('editExerciseSimpleConfig')(state)
  };
})(
  reduxForm({
    form: 'editExerciseSimpleConfig',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    immutableProps: [
      'formValues',
      'supplementaryFiles',
      'exerciseTests',
      'handleSubmit'
    ]
  })(EditExerciseSimpleConfigForm)
);
