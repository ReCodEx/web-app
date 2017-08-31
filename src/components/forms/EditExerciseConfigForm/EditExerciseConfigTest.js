import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Field } from 'redux-form';
import { SelectField } from '../Fields';
import EditExerciseConfigVariable from './EditExerciseConfigVariable';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const EditExerciseConfigTest = ({
  prefix,
  tests,
  supplementaryFiles,
  pipelines,
  runtimeEnvironmentIndex,
  fetchVariables
}) =>
  <tbody>
    {tests.map((test, index) => [
      <tr key={`${index}.first`}>
        <td style={{ verticalAlign: 'middle' }} rowSpan={2}>
          <b>
            {test.name}
          </b>
        </td>
        <td>
          <ResourceRenderer resource={pipelines.toArray()}>
            {(...pipelines) =>
              <Field
                name={`${prefix}.${index}.pipelines.0.name`}
                component={SelectField}
                options={[{ key: '', name: '...' }].concat(
                  pipelines
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(data => {
                      const obj = {};
                      obj['key'] = data.id;
                      obj['name'] = data.name;
                      return obj;
                    })
                )}
                label={''}
                onBlur={e => {
                  fetchVariables(runtimeEnvironmentIndex, index);
                  e.preventDefault();
                }}
              />}
          </ResourceRenderer>
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
          <ResourceRenderer resource={pipelines.toArray()}>
            {(...pipelines) =>
              <Field
                name={`${prefix}.${index}.pipelines.1.name`}
                component={SelectField}
                options={[{ key: '', name: '...' }].concat(
                  pipelines
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(data => {
                      const obj = {};
                      obj['key'] = data.id;
                      obj['name'] = data.name;
                      return obj;
                    })
                )}
                label={''}
                onBlur={e => {
                  fetchVariables(runtimeEnvironmentIndex, index);
                  e.preventDefault();
                }}
              />}
          </ResourceRenderer>
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
  supplementaryFiles: ImmutablePropTypes.map,
  pipelines: ImmutablePropTypes.map,
  runtimeEnvironmentIndex: PropTypes.number.isRequired,
  fetchVariables: PropTypes.func
};

export default EditExerciseConfigTest;
