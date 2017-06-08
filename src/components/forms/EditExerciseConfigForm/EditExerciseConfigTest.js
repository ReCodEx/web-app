import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { SelectField } from '../Fields';

const EditExerciseConfigTest = ({ prefix, tests }) => (
  <tbody>
    {tests.map((test, index) => (
      <tr key={index}>
        <td style={{ verticalAlign: 'middle' }}>
          <b>{test.name}</b>
        </td>
        <td>
          <Field
            name={`${prefix}.compilation`}
            component={SelectField}
            options={[{ key: '', name: '...' }].concat(
              test.pipelines.map(pipeline => ({
                key: pipeline,
                name: pipeline
              }))
            )}
            label={''}
          />
        </td>
        <td>
          <Field
            name={`${prefix}.execution`}
            component={SelectField}
            options={[{ key: '', name: '...' }].concat(
              test.pipelines.map(pipeline => ({
                key: pipeline,
                name: pipeline
              }))
            )}
            label={''}
          />
        </td>
      </tr>
    ))}
  </tbody>
);

EditExerciseConfigTest.propTypes = {
  prefix: PropTypes.string.isRequired,
  tests: PropTypes.array.isRequired
};

export default EditExerciseConfigTest;
