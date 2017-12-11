import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Icon from 'react-fontawesome';

import Button from '../../widgets/FlatButton';
import {
  SelectField,
  TextField,
  ExpandingTextField,
  ExpandingInputFilesField,
  CheckboxField
} from '../Fields';
import Confirm from '../../forms/Confirm';

import './EditExerciseSimpleConfigForm.css';

const messages = defineMessages({
  normal: {
    id: 'recodex-judge-normal',
    defaultMessage: 'Token judge'
  },
  float: {
    id: 'recodex-judge-float',
    defaultMessage: 'Float-numbers judge'
  },
  normalNewline: {
    id: 'recodex-judge-normal-newline',
    defaultMessage: 'Token judge (ignoring ends of lines)'
  },
  floatNewline: {
    id: 'recodex-judge-float-newline',
    defaultMessage: 'Float-numbers judge (ignoring ends of lines)'
  },
  shuffle: {
    id: 'recodex-judge-shuffle',
    defaultMessage: 'Unordered-tokens judge'
  },
  shuffleRows: {
    id: 'recodex-judge-shuffle-rows',
    defaultMessage: 'Unordered-rows judge'
  },
  shuffleAll: {
    id: 'recodex-judge-shuffle-all',
    defaultMessage: 'Unordered-tokens-and-rows judge'
  },
  shuffleNewline: {
    id: 'recodex-judge-shuffle-newline',
    defaultMessage: 'Unordered-tokens judge (ignoring ends of lines)'
  },
  diff: {
    id: 'diff',
    defaultMessage: 'Binary-safe judge'
  }
});

const validateExpectedOutput = value =>
  !value || value.trim() === ''
    ? <FormattedMessage
        id="app.editExerciseSimpleConfigForm.validation.expectedOutput"
        defaultMessage="Please, fill in the expected output file."
      />
    : undefined;

const validateOutputFile = value =>
  !value || value.trim() === ''
    ? <FormattedMessage
        id="app.editExerciseSimpleConfigForm.validation.outputFile"
        defaultMessage="Please, fill in the name of the output file."
      />
    : undefined;

const validateCustomJudge = value =>
  !value || value.trim() === ''
    ? <FormattedMessage
        id="app.editExerciseSimpleConfigForm.validation.customJudge"
        defaultMessage="Please, select the custom judge binary for this test or use one of the standard judges instead."
      />
    : undefined;

const EditExerciseSimpleConfigTest = ({
  supplementaryFiles,
  formValues,
  testName,
  test,
  testKey,
  testIndex,
  smartFill,
  intl
}) => {
  const supplementaryFilesOptions = supplementaryFiles
    .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
    .filter((item, pos, arr) => arr.indexOf(item) === pos)
    .map(data => ({
      key: data.name,
      name: data.name
    }));
  return (
    <div className="configRow">
      <Row>
        <Col lg={12}>
          <h3>
            {testName}
          </h3>
        </Col>
      </Row>
      <Row>
        <Col lg={3}>
          <h4>
            <FormattedMessage
              id="app.editExerciseSimpleConfigTests.inputTitle"
              defaultMessage="Input"
            />
          </h4>
          <FieldArray
            name={`${test}.inputFiles`}
            component={ExpandingInputFilesField}
            options={supplementaryFilesOptions}
            leftLabel={
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.inputFilesActual"
                defaultMessage="Input file:"
              />
            }
            rightLabel={
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.inputFilesRename"
                defaultMessage="Rename as:"
              />
            }
          />
          <Field
            name={`${test}.inputStdin`}
            component={SelectField}
            options={supplementaryFilesOptions}
            addEmptyOption={true}
            label={
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.inputStdin"
                defaultMessage="Stdin:"
              />
            }
          />
        </Col>
        <Col lg={3}>
          <h4>
            <FormattedMessage
              id="app.editExerciseSimpleConfigTests.executionTitle"
              defaultMessage="Execution"
            />
          </h4>
          <FieldArray
            name={`${test}.runArgs`}
            component={ExpandingTextField}
            label={
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.executionArguments"
                defaultMessage="Execution arguments:"
              />
            }
          />
        </Col>
        <Col lg={3}>
          <h4>
            <FormattedMessage
              id="app.editExerciseSimpleConfigTests.outputTitle"
              defaultMessage="Output"
            />
          </h4>
          <Field
            name={`${test}.useOutFile`}
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.useOutfile"
                defaultMessage="Use output file instead of stdout"
              />
            }
          />
          {formValues &&
            formValues.config &&
            formValues.config[testKey] &&
            (formValues.config[testKey].useOutFile === true ||
              formValues.config[testKey].useOutFile === 'true') &&
            <Field
              name={`${test}.outputFile`}
              component={TextField}
              validate={validateOutputFile}
              label={
                <FormattedMessage
                  id="app.editExerciseSimpleConfigTests.outputFile"
                  defaultMessage="Output file:"
                />
              }
            />}
          <Field
            name={`${test}.expectedOutput`}
            component={SelectField}
            options={supplementaryFilesOptions}
            addEmptyOption={true}
            validate={validateExpectedOutput}
            label={
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.expectedOutput"
                defaultMessage="Expected output:"
              />
            }
          />
        </Col>
        <Col lg={3}>
          <h4>
            <FormattedMessage
              id="app.editExerciseSimpleConfigTests.judgeTitle"
              defaultMessage="Judge"
            />
          </h4>
          <Field
            name={`${test}.useCustomJudge`}
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.useCustomJudge"
                defaultMessage="Use custom judge binary"
              />
            }
          />
          {formValues &&
          formValues.config &&
          formValues.config[testKey] &&
          (formValues.config[testKey].useCustomJudge === true ||
            formValues.config[testKey].useCustomJudge === 'true')
            ? <Field
                name={`${test}.customJudgeBinary`}
                component={SelectField}
                options={supplementaryFilesOptions}
                addEmptyOption={true}
                validate={validateCustomJudge}
                label={
                  <FormattedMessage
                    id="app.editExerciseSimpleConfigTests.customJudgeBinary"
                    defaultMessage="Custom judge executable:"
                  />
                }
              />
            : <Field
                name={`${test}.judgeBinary`}
                component={SelectField}
                options={[
                  {
                    key: 'recodex-judge-normal',
                    name: intl.formatMessage(messages.normal)
                  },
                  {
                    key: 'recodex-judge-float',
                    name: intl.formatMessage(messages.float)
                  },
                  {
                    key: 'recodex-judge-normal-newline',
                    name: intl.formatMessage(messages.normalNewline)
                  },
                  {
                    key: 'recodex-judge-float-newline',
                    name: intl.formatMessage(messages.floatNewline)
                  },
                  {
                    key: 'recodex-judge-shuffle',
                    name: intl.formatMessage(messages.shuffle)
                  },
                  {
                    key: 'recodex-judge-shuffle-rows',
                    name: intl.formatMessage(messages.shuffleRows)
                  },
                  {
                    key: 'recodex-judge-shuffle-all',
                    name: intl.formatMessage(messages.shuffleAll)
                  },
                  {
                    key: 'recodex-judge-shuffle-newline',
                    name: intl.formatMessage(messages.shuffleNewline)
                  },
                  {
                    key: 'diff',
                    name: intl.formatMessage(messages.diff)
                  }
                ]}
                label={
                  <FormattedMessage
                    id="app.editExerciseSimpleConfigTests.judgeType"
                    defaultMessage="Judge:"
                  />
                }
              />}
          {formValues &&
            formValues.config &&
            formValues.config[testKey] &&
            (formValues.config[testKey].useCustomJudge === true ||
              formValues.config[testKey].useCustomJudge === 'true') &&
            <FieldArray
              name={`${test}.judgeArgs`}
              component={ExpandingTextField}
              label={
                <FormattedMessage
                  id="app.editExerciseSimpleConfigTests.judgeArgs"
                  defaultMessage="Judge arguments:"
                />
              }
            />}
          {testIndex === 0 &&
            <div style={{ textAlign: 'right', padding: '1em' }}>
              <Confirm
                id={'smartFill'}
                onConfirmed={smartFill}
                question={
                  <FormattedMessage
                    id="app.editExerciseConfigForm.smartFill.yesNoQuestion"
                    defaultMessage="Do you really wish to overwrite configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
                  />
                }
              >
                <Button bsStyle={'primary'} className="btn-flat">
                  <Icon name="arrows" />{' '}
                  <FormattedMessage
                    id="app.editExerciseConfigForm.smartFill"
                    defaultMessage="Smart Fill"
                  />
                </Button>
              </Confirm>
            </div>}
        </Col>
      </Row>
    </div>
  );
};

EditExerciseSimpleConfigTest.propTypes = {
  testName: PropTypes.string.isRequired,
  test: PropTypes.string.isRequired,
  testKey: PropTypes.string.isRequired,
  testIndex: PropTypes.number.isRequired,
  supplementaryFiles: PropTypes.array.isRequired,
  exerciseTests: PropTypes.array,
  formValues: PropTypes.object,
  smartFill: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(EditExerciseSimpleConfigTest);
