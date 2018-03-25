import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { Well, Row, Col } from 'react-bootstrap';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Icon from 'react-fontawesome';

import { safeGet, EMPTY_ARRAY } from '../../../helpers/common';
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

class EditExerciseSimpleConfigTest extends Component {
  constructor(props) {
    super(props);
    this.state = { compilationOpen: null }; // null means the user has not changed the state and
  }

  compilationOpen = ev => {
    ev.preventDefault();
    this.setState({ compilationOpen: true });
  };

  compilationClose = ev => {
    ev.preventDefault();
    this.setState({ compilationOpen: false });
  };

  getPossibleEntryPoints = envId => {
    const { compilationParams, environmetnsWithEntryPoints, intl } = this.props;
    if (!environmetnsWithEntryPoints.find(e => e === envId)) {
      return EMPTY_ARRAY;
    }

    const files = safeGet(
      compilationParams,
      [envId, 'extra-files'],
      EMPTY_ARRAY
    );

    return files
      .filter(({ file, name }) => file && name)
      .map(({ name }) => ({
        key: name,
        name
      }))
      .sort((a, b) => a.name.localeCompare(b.name, intl.locale));
  };

  render() {
    const {
      supplementaryFiles,
      exercise,
      hasCompilationExtraFiles,
      useOutFile,
      useCustomJudge,
      testName,
      test,
      testErrors,
      smartFill,
      intl
    } = this.props;
    const supplementaryFilesOptions = supplementaryFiles
      .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
      .filter((item, pos, arr) => arr.indexOf(item) === pos) // WTF?
      .map(data => ({
        key: data.name,
        name: data.name
      }));
    return (
      <div className="configRow">
        <Row>
          <Col sm={12}>
            <h3>
              {testName}
            </h3>
          </Col>
        </Row>
        {this.state.compilationOpen === true ||
        (this.state.compilationOpen === null && hasCompilationExtraFiles)
          ? <Well>
              <h4 className="compilation-close" onClick={this.compilationClose}>
                <Icon name="minus-square-o" />&nbsp;&nbsp;
                <FormattedMessage
                  id="app.editExerciseSimpleConfigTests.compilationTitle"
                  defaultMessage="Compilation/Execution"
                />
              </h4>
              <p className="text-muted small">
                <FormattedMessage
                  id="app.editExerciseSimpleConfigTests.compilationInfo"
                  defaultMessage="Additional files that are added to compilation (in case of compiled environments) or execution (in case of interpreted environments)."
                />
              </p>
              <div className="compilation">
                <table>
                  <tbody>
                    <tr>
                      {exercise.runtimeEnvironments
                        .sort((a, b) =>
                          a.name.localeCompare(b.name, intl.locale)
                        )
                        .map(env => {
                          const possibleEntryPoints = this.getPossibleEntryPoints(
                            env.id
                          );
                          return (
                            <td key={env.id}>
                              <h5>
                                {env.name}
                              </h5>
                              <FieldArray
                                name={`${test}.compilation.${env.id}.extra-files`}
                                component={ExpandingInputFilesField}
                                options={supplementaryFilesOptions}
                                leftLabel={
                                  <FormattedMessage
                                    id="app.editExerciseSimpleConfigTests.extraFilesActual"
                                    defaultMessage="Extra file:"
                                  />
                                }
                                rightLabel={
                                  <FormattedMessage
                                    id="app.editExerciseSimpleConfigTests.extraFilesRename"
                                    defaultMessage="Rename as:"
                                  />
                                }
                              />
                              <br />
                              {possibleEntryPoints.length > 0 &&
                                <Field
                                  name={`${test}.compilation.${env.id}.entryPoint`}
                                  component={SelectField}
                                  options={this.getPossibleEntryPoints(env.id)}
                                  addEmptyOption={true}
                                  label={
                                    <FormattedMessage
                                      id="app.editExerciseSimpleConfigTests.entryPoint"
                                      defaultMessage="Point of entry (bootstrap file):"
                                    />
                                  }
                                />}
                            </td>
                          );
                        })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Well>
          : <div
              className="text-muted compilation-open"
              onClick={this.compilationOpen}
            >
              <Icon name="plus-square-o" />&nbsp;&nbsp;
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.compilationTitle"
                defaultMessage="Compilation/Execution"
              />
            </div>}
        <Row>
          <Col md={6} lg={3}>
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
          <Col md={6} lg={3}>
            <h4>
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.cmdlineTitle"
                defaultMessage="Command Line"
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
          <Col md={6} lg={3}>
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
            {useOutFile &&
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
          <Col md={6} lg={3}>
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
            {useCustomJudge
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
            {useCustomJudge &&
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
            {Boolean(smartFill) &&
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
                  <Button
                    bsStyle={'primary'}
                    className="btn-flat"
                    disabled={Boolean(testErrors)}
                  >
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
  }
}

EditExerciseSimpleConfigTest.propTypes = {
  exercise: PropTypes.object,
  testName: PropTypes.string.isRequired,
  test: PropTypes.string.isRequired,
  supplementaryFiles: PropTypes.array.isRequired,
  exerciseTests: PropTypes.array,
  hasCompilationExtraFiles: PropTypes.bool,
  useOutFile: PropTypes.bool,
  useCustomJudge: PropTypes.bool,
  compilationParams: PropTypes.object,
  environmetnsWithEntryPoints: PropTypes.array.isRequired,
  testErrors: PropTypes.object,
  smartFill: PropTypes.func,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(EditExerciseSimpleConfigTest);
