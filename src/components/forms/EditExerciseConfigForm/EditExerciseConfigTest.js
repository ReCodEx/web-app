import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { TextField } from '../Fields';

const EditExerciseConfigTest = ({ prefix, tests }) => (
  <tbody>
    {tests.map((test, index) => [
      <tr key={`${index}.first`}>
        <td style={{ verticalAlign: 'middle' }} rowSpan={2}>
          <b>{test.name}</b>
        </td>
        <td>
          <Field
            name={`${prefix}.${index}.pipelines.0.name`}
            component={TextField}
            label={''}
          />
        </td>
        {test.pipelines &&
          test.pipelines[0] &&
          test.pipelines[0].variables &&
          test.pipelines[0].variables.map((variable, variableIndex) => (
            <td key={variable.name}>
              <Field
                name={`${prefix}.${index}.pipelines.0.variables.${variableIndex}.value`}
                component={TextField}
                label={variable.name + ':'}
              />
            </td>
          ))}
      </tr>,
      <tr key={`${index}.second`}>
        <td>
          <Field
            name={`${prefix}.${index}.pipelines.1.name`}
            component={TextField}
            label={''}
          />
        </td>
        {test.pipelines &&
          test.pipelines[1] &&
          test.pipelines[1].variables &&
          test.pipelines[1].variables.map((variable, variableIndex) => (
            <td key={variable.name}>
              <Field
                name={`${prefix}.${index}.pipelines.1.variables.${variableIndex}.value`}
                component={TextField}
                label={variable.name + ':'}
              />
            </td>
          ))}
      </tr>
    ])}
  </tbody>
);

EditExerciseConfigTest.propTypes = {
  prefix: PropTypes.string.isRequired,
  tests: PropTypes.array.isRequired
};

export default EditExerciseConfigTest;
