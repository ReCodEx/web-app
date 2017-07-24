import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Field } from 'redux-form';
import { TextField } from '../Fields';
import EditExerciseConfigVariable from './EditExerciseConfigVariable';

const EditExerciseConfigTest = ({ prefix, tests, supplementaryFiles }) =>
  <tbody>
    {tests.map((test, index) => [
      <tr key={`${index}.first`}>
        <td style={{ verticalAlign: 'middle' }} rowSpan={2}>
          <b>
            {test.name}
          </b>
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
          test.pipelines[0].variables.map((variable, variableIndex) =>
            <EditExerciseConfigVariable
              key={`${prefix}.${index}.pipelines.0.variables.${variableIndex}`}
              prefix={`${prefix}.${index}.pipelines.0.variables.${variableIndex}`}
              data={variable}
              supplementaryFiles={supplementaryFiles}
            />
          )}
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
          test.pipelines[1].variables.map((variable, variableIndex) =>
            <EditExerciseConfigVariable
              key={`${prefix}.${index}.pipelines.1.variables.${variableIndex}`}
              prefix={`${prefix}.${index}.pipelines.1.variables.${variableIndex}`}
              data={variable}
              supplementaryFiles={supplementaryFiles}
            />
          )}
      </tr>
    ])}
  </tbody>;

EditExerciseConfigTest.propTypes = {
  prefix: PropTypes.string.isRequired,
  tests: PropTypes.array.isRequired,
  supplementaryFiles: ImmutablePropTypes.map
};

export default EditExerciseConfigTest;
