import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Alert, Table } from 'react-bootstrap';
import classnames from 'classnames';

import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import SubmitButton from '../SubmitButton';

import EditExerciseAdvancedConfigTest from './EditExerciseAdvancedConfigTest';
import { encodeNumId } from '../../../helpers/common';
import { SUBMIT_BUTTON_MESSAGES } from '../../../helpers/exercise/config';
import { advancedExerciseConfigFormFill } from '../../../redux/modules/exerciseConfigs';
import { exerciseConfigFormErrors } from '../../../redux/selectors/exerciseConfigs';

import styles from './EditExerciseAdvancedConfig.less';

class EditExerciseAdvancedConfigForm extends Component {
  render() {
    const {
      pipelines,
      pipelinesVariables = null,
      reset,
      handleSubmit,
      submitting,
      submitFailed,
      submitSucceeded,
      invalid,
      dirty,
      formErrors,
      supplementaryFiles,
      exerciseTests,
      rawFill,
      intl: { locale },
    } = this.props;

    return (
      <FormBox
        id="exercise-config-form"
        title={<FormattedMessage id="app.editExercise.editConfig" defaultMessage="Edit Exercise Configuration" />}
        unlimitedHeight
        noPadding
        success={submitSucceeded}
        dirty={dirty}
        footer={
          <div className="text-center">
            {dirty && (
              <span>
                <Button type="reset" onClick={reset} bsStyle="danger">
                  <RefreshIcon gapRight />
                  <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                </Button>
              </span>
            )}

            <SubmitButton
              id="editExerciseAdvancedConfig"
              invalid={invalid}
              submitting={submitting}
              dirty={dirty}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
              messages={SUBMIT_BUTTON_MESSAGES}
            />
          </div>
        }>
        {submitFailed && (
          <Alert bsStyle="danger">
            <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
          </Alert>
        )}

        {pipelinesVariables && (
          <Table
            className={classnames({
              'no-margin': true,
              [styles.configTable]: true,
            })}>
            {exerciseTests
              .sort((a, b) => a.name.localeCompare(b.name, locale))
              .map((test, idx) => (
                <EditExerciseAdvancedConfigTest
                  key={idx}
                  pipelines={pipelines}
                  pipelinesVariables={pipelinesVariables}
                  supplementaryFiles={supplementaryFiles}
                  testName={test.name}
                  test={'config.' + encodeNumId(test.id)}
                  testErrors={formErrors && formErrors[encodeNumId(test.id)]}
                  rawFill={exerciseTests.length > 1 ? rawFill(test.id, exerciseTests) : undefined}
                />
              ))}
          </Table>
        )}
      </FormBox>
    );
  }
}

EditExerciseAdvancedConfigForm.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  exerciseTests: PropTypes.array,
  pipelines: PropTypes.array,
  pipelinesVariables: PropTypes.array,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  dirty: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  formErrors: PropTypes.object,
  supplementaryFiles: PropTypes.array,
  rawFill: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

const FORM_NAME = 'editExerciseAdvancedConfig';

export default connect(
  (state, { exerciseId }) => {
    return {
      formErrors: exerciseConfigFormErrors(state, FORM_NAME),
    };
  },
  dispatch => ({
    rawFill: (testId, tests) => ({
      all: () => dispatch(advancedExerciseConfigFormFill(FORM_NAME, testId, tests)),
      pipeline: pipelineIdx => () => dispatch(advancedExerciseConfigFormFill(FORM_NAME, testId, tests, pipelineIdx)),
      variable: (pipelineIdx, variableName) => () =>
        dispatch(advancedExerciseConfigFormFill(FORM_NAME, testId, tests, pipelineIdx, variableName)),
    }),
  })
)(
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    immutableProps: ['formValues', 'supplementaryFiles', 'exerciseTests', 'handleSubmit'],
  })(injectIntl(EditExerciseAdvancedConfigForm))
);
