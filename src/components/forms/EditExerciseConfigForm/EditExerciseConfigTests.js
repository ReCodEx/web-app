import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { TextField } from '../Fields';

const EditExerciseConfigTests = ({ tests }) => (
  <tbody>
    {tests.map((test, index) => (
      <tr key={index}>
        <td style={{ verticalAlign: 'middle' }}>
          <b>{test.name}</b>
        </td>
        <td>
          <Field
            name={`${test.name}.compilation`}
            component={TextField}
            label={''}
          />
        </td>
        <td>
          <Field
            name={`${test.name}.execution`}
            component={TextField}
            label={''}
          />
        </td>
      </tr>
    ))}
  </tbody>
);

EditExerciseConfigTests.propTypes = {
  tests: PropTypes.array.isRequired
};

export default EditExerciseConfigTests;
