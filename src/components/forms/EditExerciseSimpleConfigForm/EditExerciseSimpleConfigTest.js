import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/TheButton';
import Icon from '../../icons';
import Confirm from '../../forms/Confirm';
import { ENV_DATA_ONLY_ID, ENV_PROLOG_ID, ENV_HASKELL_ID } from '../../../helpers/exercise/environments';

import EditExerciseSimpleConfigTestCompilation from './EditExerciseSimpleConfigTestCompilation';
import EditExerciseSimpleConfigTestInputs from './EditExerciseSimpleConfigTestInputs';
import EditExerciseSimpleConfigTestExecArgs from './EditExerciseSimpleConfigTestExecArgs';
import EditExerciseSimpleConfigTestExecEntryPoint from './EditExerciseSimpleConfigTestEntryPoint';
import EditExerciseSimpleConfigTestOutput from './EditExerciseSimpleConfigTestOutput';
import EditExerciseSimpleConfigTestJudge from './EditExerciseSimpleConfigTestJudge';
import EditExerciseSimpleConfigTestExtraFiles from './EditExerciseSimpleConfigTestExtraFiles';

import './EditExerciseSimpleConfigForm.css';

const overrides = {
  [ENV_DATA_ONLY_ID]: {
    showCompilation: false,
    showInputsStdIn: false,
    showOutput: false,
    showJudgeBuiltins: false,
    showJudgeArgs: false,
  },
  [ENV_PROLOG_ID]: {
    showCompilation: false,
    showInputsFiles: false,
    showArgs: false,
    showOutputFile: false,
    showExtraFiles: true,
  },
  [ENV_HASKELL_ID]: {
    showCompilation: false,
    showArgs: false,
    showStringEntryPoint: true,
    showOutputFile: false,
    showExtraFiles: true,
  },
};

class EditExerciseSimpleConfigTest extends Component {
  render() {
    const {
      change,
      environmentsWithEntryPoints,
      exercise,
      extraFiles,
      compilationInitiallyOpened,
      smartFill,
      supplementaryFiles,
      test,
      testErrors,
      testName,
      useCustomJudge,
      useOutFile,
      readOnly = false,
    } = this.props;

    // Find out whether environment with override is selected (only standalone envs should have overrides)
    const environmentWithOverride = exercise.runtimeEnvironments
      .map(({ id }) => id)
      .find(env => Boolean(overrides[env]));
    const override = environmentWithOverride ? overrides[environmentWithOverride] : {};

    // Prepare showFlags combining defaults with overrided for given environment
    const {
      showCompilation = true, // compilation block (per-env extra files and entry points)
      showInputs = true, // input data module (input files + stdin)
      showInputsFiles = true,
      showInputsStdIn = true,
      showArgs = true, // execution args module
      showStringEntryPoint = false, // specialized input for specifying entry point as a string (e.g., Haskell function to be called)
      showOutput = true, // data output module (expected file + output file if stdout is not used)
      showOutputFile = true,
      showExtraFiles = false, // specialized extra files (for single environment)
      showJudge = true, // judge selection module
      showJudgeBuiltins = true, // select box with predefined judges
      showJudgeArgs = true, // additional args for the judge
    } = override;

    const colsShown = showInputs + showArgs + showOutput + showJudge + showExtraFiles;
    const lgColSpan = colsShown <= 4 ? 12 / colsShown : 3;

    return (
      <div className="configRow">
        <Row>
          <Col sm={12}>
            <h3>{testName}</h3>
          </Col>
        </Row>

        {showCompilation && (
          <EditExerciseSimpleConfigTestCompilation
            change={change}
            environmentsWithEntryPoints={environmentsWithEntryPoints}
            exercise={exercise}
            extraFiles={extraFiles}
            compilationInitiallyOpened={compilationInitiallyOpened}
            smartFillCompilation={smartFill ? smartFill.compilation : null}
            supplementaryFiles={supplementaryFiles}
            test={test}
            testErrors={testErrors}
            readOnly={readOnly}
          />
        )}

        {showStringEntryPoint && (
          <Row>
            <Col lg={12}>
              <EditExerciseSimpleConfigTestExecEntryPoint
                smartFillEntryPoint={smartFill ? smartFill.entryPoint : null}
                test={test}
                testErrors={testErrors}
                readOnly={readOnly}
              />
            </Col>
          </Row>
        )}

        <Row>
          {showInputs && (
            <Col md={6} lg={lgColSpan}>
              <EditExerciseSimpleConfigTestInputs
                change={change}
                smartFillInputs={smartFill ? smartFill.input : null}
                supplementaryFiles={supplementaryFiles}
                test={test}
                testErrors={testErrors}
                showInputFiles={showInputsFiles}
                showStdinFile={showInputsStdIn}
                readOnly={readOnly}
              />
            </Col>
          )}

          {showExtraFiles && (
            <Col md={6} lg={lgColSpan}>
              <EditExerciseSimpleConfigTestExtraFiles
                change={change}
                smartFillExtraFiles={smartFill ? smartFill.extraFiles : null}
                supplementaryFiles={supplementaryFiles}
                test={test}
                testErrors={testErrors}
                environmentId={environmentWithOverride}
                readOnly={readOnly}
              />
            </Col>
          )}

          {showArgs && (
            <Col md={6} lg={lgColSpan}>
              <EditExerciseSimpleConfigTestExecArgs
                smartFillArgs={smartFill ? smartFill.args : null}
                test={test}
                testErrors={testErrors}
                readOnly={readOnly}
              />
            </Col>
          )}

          {showOutput && (
            <Col md={6} lg={lgColSpan}>
              <EditExerciseSimpleConfigTestOutput
                smartFillOutput={smartFill ? smartFill.output : null}
                supplementaryFiles={supplementaryFiles}
                test={test}
                testErrors={testErrors}
                useOutFile={useOutFile}
                showOutFile={showOutputFile}
                readOnly={readOnly}
              />
            </Col>
          )}

          {showJudge && (
            <Col md={6} lg={lgColSpan}>
              <EditExerciseSimpleConfigTestJudge
                smartFillJudge={smartFill ? smartFill.judge : null}
                supplementaryFiles={supplementaryFiles}
                test={test}
                testErrors={testErrors}
                useCustomJudge={useCustomJudge}
                showBuiltins={showJudgeBuiltins}
                showJudgeArgs={showJudgeArgs}
                readOnly={readOnly}
              />
            </Col>
          )}
        </Row>

        {Boolean(smartFill) && !readOnly && (
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
              <Button variant="primary" disabled={Boolean(testErrors)}>
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
  change: PropTypes.func.isRequired,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  exercise: PropTypes.object,
  exerciseTests: PropTypes.array,
  extraFiles: PropTypes.object,
  compilationInitiallyOpened: PropTypes.bool,
  smartFill: PropTypes.object,
  supplementaryFiles: PropTypes.array.isRequired,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
  testName: PropTypes.string.isRequired,
  useCustomJudge: PropTypes.bool,
  useOutFile: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default EditExerciseSimpleConfigTest;
