import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import EditExerciseConfigTest from './EditExerciseConfigTest';
import { TextField, SelectField } from '../Fields';
import { getJsData } from '../../../redux/helpers/resourceManager';

const EditExerciseConfigTests = ({
  prefix,
  i,
  testConfigs,
  runtimeEnvironments
}) => (
  <div>
    <Field
      name={`${prefix}.name`}
      component={TextField}
      label={
        <FormattedMessage
          id="app.editExerciseConfigForm.configName"
          defaultMessage="Name of Configuration:"
        />
      }
    />

    <Field
      name={`${prefix}.runtimeEnvironmentId`}
      component={SelectField}
      options={[
        { key: '', name: '...' },
        ...runtimeEnvironments
          .map(getJsData)
          .map(env => ({ key: env.id, name: env.name }))
          .toArray()
      ]}
      label={
        <FormattedMessage
          id="app.editExerciseConfigForm.runtimeEnvironment"
          defaultMessage="Select runtime environment:"
        />
      }
    />
    <Table>
      <thead>
        <tr>
          <th />
          <th>
            <FormattedMessage
              id="app.editExerciseConfigForm.compilation"
              defaultMessage="Compilation"
            />
          </th>
          <th>
            <FormattedMessage
              id="app.editExerciseConfigForm.execution"
              defaultMessage="Execution"
            />
          </th>
        </tr>
      </thead>
      <FieldArray
        name={`${prefix}.tests`}
        component={EditExerciseConfigTest}
        tests={
          testConfigs && testConfigs[i] && testConfigs[i].tests
            ? testConfigs[i].tests
            : []
        }
        prefix={`${prefix}.tests`}
      />
    </Table>
  </div>
);

EditExerciseConfigTests.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired,
  testConfigs: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.object.isRequired
};

export default EditExerciseConfigTests;
