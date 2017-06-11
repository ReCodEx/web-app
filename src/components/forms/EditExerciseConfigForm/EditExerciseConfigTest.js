import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { TextField } from '../Fields';

const EditExerciseConfigTest = ({ prefix, tests }) => (
  <tbody>
    {tests.map((test, index) => (
      <tr key={index}>
        <td style={{ verticalAlign: 'middle' }}>
          <b>{test.name}</b>
        </td>
        <td>
          <Field
            name={`${prefix}.${index}.pipelines.0`}
            component={TextField}
            label={''}
          />
        </td>
        <td>
          <Field
            name={`${prefix}.${index}.pipelines.1`}
            component={TextField}
            label={''}
          />
        </td>
        {test.variables &&
          Object.keys(test.variables).map(key => (
            <td key={key}>
              <Field
                name={`${prefix}.${index}.variables.${key}`}
                component={TextField}
                label={key + ':'}
              />
            </td>
          ))}
      </tr>
    ))}
  </tbody>
);

EditExerciseConfigTest.propTypes = {
  prefix: PropTypes.string.isRequired,
  tests: PropTypes.array.isRequired
};

export default EditExerciseConfigTest;
