import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Table } from 'react-bootstrap';
import classnames from 'classnames';

import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import { RefreshIcon } from '../../icons';
import SubmitButton from '../SubmitButton';

import EditExerciseAdvancedConfigTest from './EditExerciseAdvancedConfigTest.js';
import { encodeNumId } from '../../../helpers/common.js';
import { SUBMIT_BUTTON_MESSAGES } from '../../../helpers/exercise/config.js';
import { advancedExerciseConfigFormFill } from '../../../redux/modules/exerciseConfigs.js';
import { exerciseConfigFormErrors } from '../../../redux/selectors/exerciseConfigs.js';

import * as styles from './EditExerciseAdvancedConfig.less';

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
      exerciseFiles,
      exerciseTests,
      rawFill,
      readOnly = false,
      intl: { locale },
    } = this.props;

    return (
      <FormBox
        id="exercise-config-form"
        title={<FormattedMessage id="app.editExercise.editConfig" defaultMessage="Exercise Configuration" />}
        unlimitedHeight
        noPadding
        success={submitSucceeded}
        dirty={dirty}
        footer={
          !readOnly ? (
            <div className="text-center">
              {dirty && (
                <span>
                  <Button type="reset" onClick={reset} variant="danger">
                    <RefreshIcon gapRight={2} />
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
          ) : null
        }>
        {submitFailed && (
          <Callout variant="danger">
            <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
          </Callout>
        )}

        {pipelinesVariables && (
          <Table
            className={classnames({
              'm-0': true,
              [styles.configTable]: true,
            })}>
            {exerciseTests
              .sort((a, b) => a.name.localeCompare(b.name, locale))
              .map((test, idx) => (
                <EditExerciseAdvancedConfigTest
                  key={idx}
                  pipelines={pipelines}
                  pipelinesVariables={pipelinesVariables}
                  exerciseFiles={exerciseFiles}
                  testName={test.name}
                  test={'config.' + encodeNumId(test.id)}
                  testErrors={formErrors && formErrors[encodeNumId(test.id)]}
                  rawFill={exerciseTests.length > 1 ? rawFill(test.id, exerciseTests) : undefined}
                  readOnly={readOnly}
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
  exerciseFiles: PropTypes.array,
  rawFill: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  intl: PropTypes.object.isRequired,
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
    immutableProps: ['formValues', 'exerciseFiles', 'exerciseTests', 'handleSubmit'],
  })(injectIntl(EditExerciseAdvancedConfigForm))
);
