import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import Confirm from '../../forms/Confirm';

import EditExerciseSimpleConfigTestCompilation from './EditExerciseSimpleConfigTestCompilation';
import EditExerciseSimpleConfigTestInputs from './EditExerciseSimpleConfigTestInputs';
import EditExerciseSimpleConfigTestCmdLine from './EditExerciseSimpleConfigTestCmdLine';
import EditExerciseSimpleConfigTestOutput from './EditExerciseSimpleConfigTestOutput';
import EditExerciseSimpleConfigTestJudge from './EditExerciseSimpleConfigTestJudge';

import './EditExerciseSimpleConfigForm.css';

class EditExerciseSimpleConfigTest extends Component {
  render() {
    const {
      change,
      environmentsWithEntryPoints,
      exercise,
      extraFiles,
      jarFiles,
      smartFill,
      supplementaryFiles,
      test,
      testErrors,
      testName,
      useCustomJudge,
      useOutFile,
    } = this.props;
    return (
      <div className="configRow">
        <Row>
          <Col sm={12}>
            <h3>{testName}</h3>
          </Col>
        </Row>

        <EditExerciseSimpleConfigTestCompilation
          change={change}
          environmentsWithEntryPoints={environmentsWithEntryPoints}
          exercise={exercise}
          extraFiles={extraFiles}
          jarFiles={jarFiles}
          smartFillCompilation={smartFill ? smartFill.compilation : null}
          supplementaryFiles={supplementaryFiles}
          test={test}
          testErrors={testErrors}
        />

        <Row>
          <Col md={6} lg={3}>
            <EditExerciseSimpleConfigTestInputs
              change={change}
              smartFillInputs={smartFill ? smartFill.input : null}
              supplementaryFiles={supplementaryFiles}
              test={test}
              testErrors={testErrors}
            />
          </Col>
          <Col md={6} lg={3}>
            <EditExerciseSimpleConfigTestCmdLine
              smartFillArgs={smartFill ? smartFill.args : null}
              test={test}
              testErrors={testErrors}
            />
          </Col>
          <Col md={6} lg={3}>
            <EditExerciseSimpleConfigTestOutput
              smartFillOutput={smartFill ? smartFill.output : null}
              supplementaryFiles={supplementaryFiles}
              test={test}
              testErrors={testErrors}
              useOutFile={useOutFile}
            />
          </Col>
          <Col md={6} lg={3}>
            <EditExerciseSimpleConfigTestJudge
              smartFillJudge={smartFill ? smartFill.judge : null}
              supplementaryFiles={supplementaryFiles}
              test={test}
              testErrors={testErrors}
              useCustomJudge={useCustomJudge}
            />
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
  change: PropTypes.func.isRequired,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  exercise: PropTypes.object,
  exerciseTests: PropTypes.array,
  extraFiles: PropTypes.object,
  jarFiles: PropTypes.object,
  smartFill: PropTypes.object,
  supplementaryFiles: PropTypes.array.isRequired,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
  testName: PropTypes.string.isRequired,
  useCustomJudge: PropTypes.bool,
  useOutFile: PropTypes.bool,
};

export default EditExerciseSimpleConfigTest;
