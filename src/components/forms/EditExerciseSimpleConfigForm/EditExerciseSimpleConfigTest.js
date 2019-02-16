import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { Well, Grid, Row, Col } from 'react-bootstrap';
import { FormattedMessage, injectIntl, defineMessages, intlShape } from 'react-intl';

import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import { EMPTY_ARRAY } from '../../../helpers/common';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import {
  SelectField,
  TextField,
  ExpandingTextField,
  ExpandingInputFilesField,
  ExpandingSelectField,
  CheckboxField,
} from '../Fields';
import Confirm from '../../forms/Confirm';

import './EditExerciseSimpleConfigForm.css';

const messages = defineMessages({
  normal: {
    id: 'recodex-judge-normal',
    defaultMessage: 'Token judge',
  },
  float: {
    id: 'recodex-judge-float',
    defaultMessage: 'Float-numbers judge',
  },
  normalNewline: {
    id: 'recodex-judge-normal-newline',
    defaultMessage: 'Token judge (ignoring ends of lines)',
  },
  floatNewline: {
    id: 'recodex-judge-float-newline',
    defaultMessage: 'Float-numbers judge (ignoring ends of lines)',
  },
  shuffle: {
    id: 'recodex-judge-shuffle',
    defaultMessage: 'Unordered-tokens judge',
  },
  shuffleRows: {
    id: 'recodex-judge-shuffle-rows',
    defaultMessage: 'Unordered-rows judge',
  },
  shuffleAll: {
    id: 'recodex-judge-shuffle-all',
    defaultMessage: 'Unordered-tokens-and-rows judge',
  },
  shuffleNewline: {
    id: 'recodex-judge-shuffle-newline',
    defaultMessage: 'Unordered-tokens judge (ignoring ends of lines)',
  },
  diff: {
    id: 'diff',
    defaultMessage: 'Binary-safe judge',
  },
});

const validateExpectedOutput = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage
      id="app.editExerciseSimpleConfigForm.validation.expectedOutput"
      defaultMessage="Please, fill in the expected output file."
    />
  ) : (
    undefined
  );

const validateOutputFile = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage
      id="app.editExerciseSimpleConfigForm.validation.outputFile"
      defaultMessage="Please, fill in the name of the output file."
    />
  ) : (
    undefined
  );

const validateCustomJudge = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage
      id="app.editExerciseSimpleConfigForm.validation.customJudge"
      defaultMessage="Please, select the custom judge binary for this test or use one of the standard judges instead."
    />
  ) : (
    undefined
  );

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
    const { extraFiles, environmentsWithEntryPoints, intl } = this.props;
    if (!environmentsWithEntryPoints.includes(envId)) {
      return EMPTY_ARRAY;
    }

    const files = (extraFiles && extraFiles[envId]) || EMPTY_ARRAY;
    return files
      .filter(({ file, name }) => file && name)
      .map(({ name }) => ({
        key: name,
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, intl.locale));
  };

  hasCompilationExtraFiles() {
    const { extraFiles, jarFiles } = this.props;
    if (!extraFiles && !jarFiles) {
      return false;
    }
    for (const files of Object.values(extraFiles)) {
      if (files && files.length > 0) {
        return true;
      }
    }
    for (const files of Object.values(jarFiles)) {
      if (files && files.length > 0) {
        return true;
      }
    }
    return false;
  }

  render() {
    const {
      supplementaryFiles,
      exercise,
      useOutFile,
      useCustomJudge,
      testName,
      test,
      testErrors,
      smartFill,
      change,
      intl,
    } = this.props;
    const supplementaryFilesOptions = supplementaryFiles
      .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
      .filter((item, pos, arr) => arr.indexOf(item) === pos) // WTF?
      .map(data => ({
        key: data.name,
        name: data.name,
      }));
    return (
      <div className="configRow">
        <Row>
          <Col sm={12}>
            <h3>{testName}</h3>
          </Col>
        </Row>
        {this.state.compilationOpen === true ||
        (this.state.compilationOpen === null && this.hasCompilationExtraFiles()) ? (
          <Well>
            <h4 className="compilation-close" onClick={this.compilationClose}>
              <Icon icon={['far', 'minus-square']} gapRight />
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
                      .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
                      .map(env => {
                        const possibleEntryPoints = this.getPossibleEntryPoints(env.id);
                        return (
                          <td key={env.id}>
                            {exercise.runtimeEnvironments.length > 1 && (
                              <h4>
                                <EnvironmentsListItem runtimeEnvironment={env} longNames />
                              </h4>
                            )}

                            <Grid fluid>
                              <Row>
                                {env.id === 'java' && (
                                  /*
                                   * A special case for Java only !!!
                                   */
                                  <Col lg={exercise.runtimeEnvironments.length === 1 ? 6 : 12}>
                                    <FieldArray
                                      name={`${test}.jar-files.${env.id}`}
                                      component={ExpandingSelectField}
                                      options={supplementaryFilesOptions}
                                      label={
                                        <FormattedMessage
                                          id="app.editExerciseSimpleConfigTests.jarFiles"
                                          defaultMessage="Additional JAR file:"
                                        />
                                      }
                                      noItems={
                                        <FormattedMessage
                                          id="app.editExerciseSimpleConfigTests.noJarFiles"
                                          defaultMessage="There are no additional JAR files yet..."
                                        />
                                      }
                                    />
                                    {exercise.runtimeEnvironments.length !== 1 && <hr />}
                                  </Col>
                                )
                                /*
                                 * End of special case.
                                 */
                                }

                                <Col lg={exercise.runtimeEnvironments.length === 1 && env.id === 'java' ? 6 : 12}>
                                  <FieldArray
                                    name={`${test}.extra-files.${env.id}`}
                                    component={ExpandingInputFilesField}
                                    options={supplementaryFilesOptions}
                                    change={change}
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
                                    noItems={
                                      <FormattedMessage
                                        id="app.editExerciseSimpleConfigTests.noExtraFiles"
                                        defaultMessage="There are no extra files yet..."
                                      />
                                    }
                                  />
                                  <br />
                                  {possibleEntryPoints.length > 0 && (
                                    <Field
                                      name={`${test}.entry-point.${env.id}`}
                                      component={SelectField}
                                      options={this.getPossibleEntryPoints(env.id)}
                                      addEmptyOption={true}
                                      label={
                                        <FormattedMessage
                                          id="app.editExerciseSimpleConfigTests.entryPoint"
                                          defaultMessage="Point of entry (bootstrap file):"
                                        />
                                      }
                                    />
                                  )}
                                </Col>
                              </Row>
                            </Grid>
                          </td>
                        );
                      })}
                  </tr>
                </tbody>
              </table>
            </div>
            {Boolean(smartFill) && (
              <div className="smart-fill-tinybar">
                <Confirm
                  id="smartFillCompilation"
                  onConfirmed={smartFill.compilation}
                  question={
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillCompilation.yesNoQuestion"
                      defaultMessage="Do you really wish to overwrite compilation and execution configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
                    />
                  }>
                  <Button bsStyle="primary" className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
                    <Icon icon="arrows-alt" gapRight />
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillCompilation"
                      defaultMessage="Smart Fill Compilation"
                    />
                  </Button>
                </Confirm>
              </div>
            )}
          </Well>
        ) : (
          <div className="text-muted compilation-open" onClick={this.compilationOpen}>
            <Icon icon={['far', 'plus-square']} gapRight />
            <FormattedMessage
              id="app.editExerciseSimpleConfigTests.compilationTitle"
              defaultMessage="Compilation/Execution"
            />
          </div>
        )}
        <Row>
          <Col md={6} lg={3}>
            <h4>
              <FormattedMessage id="app.editExerciseSimpleConfigTests.inputTitle" defaultMessage="Input" />
            </h4>
            <FieldArray
              name={`${test}.input-files`}
              component={ExpandingInputFilesField}
              options={supplementaryFilesOptions}
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
            <Field
              name={`${test}.stdin-file`}
              component={SelectField}
              options={supplementaryFilesOptions}
              addEmptyOption={true}
              label={<FormattedMessage id="app.editExerciseSimpleConfigTests.inputStdin" defaultMessage="Stdin:" />}
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
          <Col md={6} lg={3}>
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
          <Col md={6} lg={3}>
            <h4>
              <FormattedMessage id="app.editExerciseSimpleConfigTests.outputTitle" defaultMessage="Output" />
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
            {useOutFile && (
              <Field
                name={`${test}.actual-output`}
                component={TextField}
                validate={validateOutputFile}
                maxLength={64}
                label={
                  <FormattedMessage id="app.editExerciseSimpleConfigTests.outputFile" defaultMessage="Output file:" />
                }
              />
            )}
            <Field
              name={`${test}.expected-output`}
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
            {Boolean(smartFill) && (
              <div className="smart-fill-tinybar">
                <Confirm
                  id="smartFillOutput"
                  onConfirmed={smartFill.output}
                  question={
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillOutput.yesNoQuestion"
                      defaultMessage="Do you really wish to overwrite output configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
                    />
                  }>
                  <Button bsStyle={'primary'} className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
                    <Icon icon="arrows-alt" gapRight />
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillOutput"
                      defaultMessage="Smart Fill Outputs"
                    />
                  </Button>
                </Confirm>
              </div>
            )}
          </Col>
          <Col md={6} lg={3}>
            <h4>
              <FormattedMessage id="app.editExerciseSimpleConfigTests.judgeTitle" defaultMessage="Judge" />
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
            {useCustomJudge ? (
              <Field
                name={`${test}.custom-judge`}
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
            ) : (
              <Field
                name={`${test}.judge-type`}
                component={SelectField}
                options={[
                  {
                    key: 'recodex-judge-normal',
                    name: intl.formatMessage(messages.normal),
                  },
                  {
                    key: 'recodex-judge-float',
                    name: intl.formatMessage(messages.float),
                  },
                  {
                    key: 'recodex-judge-normal-newline',
                    name: intl.formatMessage(messages.normalNewline),
                  },
                  {
                    key: 'recodex-judge-float-newline',
                    name: intl.formatMessage(messages.floatNewline),
                  },
                  {
                    key: 'recodex-judge-shuffle',
                    name: intl.formatMessage(messages.shuffle),
                  },
                  {
                    key: 'recodex-judge-shuffle-rows',
                    name: intl.formatMessage(messages.shuffleRows),
                  },
                  {
                    key: 'recodex-judge-shuffle-all',
                    name: intl.formatMessage(messages.shuffleAll),
                  },
                  {
                    key: 'recodex-judge-shuffle-newline',
                    name: intl.formatMessage(messages.shuffleNewline),
                  },
                  {
                    key: 'diff',
                    name: intl.formatMessage(messages.diff),
                  },
                ]}
                label={<FormattedMessage id="app.editExerciseSimpleConfigTests.judgeType" defaultMessage="Judge:" />}
              />
            )}
            {useCustomJudge && (
              <FieldArray
                name={`${test}.judge-args`}
                component={ExpandingTextField}
                maxLength={64}
                label={
                  <FormattedMessage
                    id="app.editExerciseSimpleConfigTests.judgeArgs"
                    defaultMessage="Judge arguments:"
                  />
                }
              />
            )}
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

EditExerciseSimpleConfigTest.propTypes = {
  exercise: PropTypes.object,
  testName: PropTypes.string.isRequired,
  test: PropTypes.string.isRequired,
  supplementaryFiles: PropTypes.array.isRequired,
  exerciseTests: PropTypes.array,
  extraFiles: PropTypes.object,
  jarFiles: PropTypes.object,
  useOutFile: PropTypes.bool,
  useCustomJudge: PropTypes.bool,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  testErrors: PropTypes.object,
  smartFill: PropTypes.object,
  change: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(EditExerciseSimpleConfigTest);
