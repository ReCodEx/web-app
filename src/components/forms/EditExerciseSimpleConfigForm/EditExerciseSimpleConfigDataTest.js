import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';

import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import { SelectField, ExpandingTextField, ExpandingInputFilesField } from '../Fields';
import Confirm from '../../forms/Confirm';

import './EditExerciseSimpleConfigForm.css';

const validateCustomJudge = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage
      id="app.editExerciseSimpleConfigForm.validation.customJudge"
      defaultMessage="Please, select the custom judge binary for this test or use one of the standard judges instead."
    />
  ) : (
    undefined
  );

class EditExerciseSimpleConfigDataTest extends Component {
  render() {
    const { supplementaryFiles, testName, test, testErrors, smartFill, change } = this.props;
    return (
      <div className="configRow">
        <Row>
          <Col sm={12}>
            <h3>{testName}</h3>
          </Col>
        </Row>
        <Row>
          <Col sm={12} lg={4}>
            <h4>
              <FormattedMessage id="app.editExerciseSimpleConfigTests.inputTitle" defaultMessage="Input" />
            </h4>
            <FieldArray
              name={`${test}.input-files`}
              component={ExpandingInputFilesField}
              options={supplementaryFiles}
              change={change}
              leftLabel={
                <FormattedMessage
                  id="app.editExerciseSimpleConfigTests.inputFilesActual"
                  defaultMessage="Input file:"
                />
              }
              rightLabel={
                <FormattedMessage id="app.editExerciseSimpleConfigTests.inputFilesRename" defaultMessage="Rename as:" />
              }
            />
            {Boolean(smartFill) && (
              <div className="smart-fill-tinybar">
                <Confirm
                  id="smartFillInput"
                  onConfirmed={smartFill.input}
                  question={
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillInput.yesNoQuestion"
                      defaultMessage="Do you really wish to overwrite input configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
                    />
                  }>
                  <Button bsStyle={'primary'} className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
                    <Icon icon="arrows-alt" gapRight />
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillInput"
                      defaultMessage="Smart Fill Inputs"
                    />
                  </Button>
                </Confirm>
              </div>
            )}
          </Col>
          <Col sm={12} lg={4}>
            <h4>
              <FormattedMessage id="app.editExerciseSimpleConfigTests.cmdlineTitle" defaultMessage="Command Line" />
            </h4>
            <FieldArray
              name={`${test}.run-args`}
              component={ExpandingTextField}
              maxLength={64}
              label={
                <FormattedMessage
                  id="app.editExerciseSimpleConfigTests.executionArguments"
                  defaultMessage="Execution arguments:"
                />
              }
            />
            {Boolean(smartFill) && (
              <div className="smart-fill-tinybar">
                <Confirm
                  id="smartFillArgs"
                  onConfirmed={smartFill.args}
                  question={
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillArgs.yesNoQuestion"
                      defaultMessage="Do you really wish to overwrite command line configuration of all subsequent tests using the first test as a template?"
                    />
                  }>
                  <Button bsStyle={'primary'} className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
                    <Icon icon="arrows-alt" gapRight />
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillArgs"
                      defaultMessage="Smart Fill Arguments"
                    />
                  </Button>
                </Confirm>
              </div>
            )}
          </Col>
          <Col sm={12} lg={4}>
            <h4>
              <FormattedMessage id="app.editExerciseSimpleConfigTests.judgeTitle" defaultMessage="Judge" />
            </h4>
            <Field
              name={`${test}.custom-judge`}
              component={SelectField}
              options={supplementaryFiles}
              addEmptyOption={true}
              validate={validateCustomJudge}
              label={
                <FormattedMessage
                  id="app.editExerciseSimpleConfigTests.customJudgeBinary"
                  defaultMessage="Custom judge executable:"
                />
              }
            />
            {Boolean(smartFill) && (
              <div className="smart-fill-tinybar">
                <Confirm
                  id="smartFillJudge"
                  onConfirmed={smartFill.judge}
                  question={
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillJudge.yesNoQuestion"
                      defaultMessage="Do you really wish to overwrite judge configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
                    />
                  }>
                  <Button bsStyle={'primary'} className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
                    <Icon icon="arrows-alt" gapRight />
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillJudge"
                      defaultMessage="Smart Fill Judges"
                    />
                  </Button>
                </Confirm>
              </div>
            )}
          </Col>
        </Row>
        {Boolean(smartFill) && (
          <div className="smart-fill-bar">
            <Confirm
              id="smartFillAll"
              onConfirmed={smartFill.all}
              question={
                <FormattedMessage
                  id="app.editExerciseConfigForm.smartFillAll.yesNoQuestion"
                  defaultMessage="Do you really wish to overwrite configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
                />
              }>
              <Button bsStyle={'primary'} className="btn-flat" disabled={Boolean(testErrors)}>
                <Icon icon="arrows-alt" gapRight />
                <FormattedMessage id="app.editExerciseConfigForm.smartFillAll" defaultMessage="Smart Fill All" />
              </Button>
            </Confirm>
          </div>
        )}
      </div>
    );
  }
}

EditExerciseSimpleConfigDataTest.propTypes = {
  testName: PropTypes.string.isRequired,
  test: PropTypes.string.isRequired,
  supplementaryFiles: PropTypes.array.isRequired,
  exerciseTests: PropTypes.array,
  testErrors: PropTypes.object,
  smartFill: PropTypes.object,
  change: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(EditExerciseSimpleConfigDataTest);
