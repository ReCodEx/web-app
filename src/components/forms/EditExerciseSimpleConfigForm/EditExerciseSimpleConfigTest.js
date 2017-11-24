import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import {
  SelectField,
  TextField,
  ExpandingTextField,
  ExpandingInputFilesField,
  CheckboxField
} from '../Fields';

const EditExerciseSimpleConfigTest = ({ prefix }) =>
  <Row>
    <h3>Test 1</h3>
    <Col lg={3}>
      <h4>
        <FormattedMessage
          id="app.editExerciseSimpleConfigTests.inputTitle"
          defaultMessage="input"
        />
      </h4>
      <Field
        name={`${prefix}.inputFiles`}
        component={ExpandingInputFilesField}
        options={[{ key: '', name: '...' }]}
        leftLabel={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.inputFilesActual"
            defaultMessage="Input file:"
          />
        }
        rightLabel={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.inputFilesRename"
            defaultMessage="Renamed file name:"
          />
        }
      />
      <Field
        name={`${prefix}.inputStdin`}
        component={SelectField}
        options={[{ key: '', name: '...' }]}
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
      <Field
        name={`${prefix}.execArgs`}
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
        name={`${prefix}.useStdout`}
        component={CheckboxField}
        onOff
        label={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.useOutfile"
            defaultMessage="Use output file instead of stdout"
          />
        }
      />
      <Field
        name={`${prefix}.output`}
        component={TextField}
        label={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.outputFile"
            defaultMessage="Output file:"
          />
        }
      />
      <Field
        name={`${prefix}.outputSpecimen`}
        component={SelectField}
        options={[{ key: '', name: '...' }]}
        label={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.outputSpecimen"
            defaultMessage="Output specimen:"
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
        name={`${prefix}.judgeType`}
        component={SelectField}
        options={[{ key: '', name: '...' }]}
        label={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.judgeType"
            defaultMessage="Judge type:"
          />
        }
      />
      <Field
        name={`${prefix}.judgeArgs`}
        component={TextField}
        label={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.judgeArgs"
            defaultMessage="Judge arguments:"
          />
        }
      />
    </Col>
  </Row>;

EditExerciseSimpleConfigTest.propTypes = {
  prefix: PropTypes.string.isRequired
};

export default EditExerciseSimpleConfigTest;
