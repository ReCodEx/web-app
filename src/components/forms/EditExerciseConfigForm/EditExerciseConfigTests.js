import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import EditExerciseConfigTest from './EditExerciseConfigTest';

const EditExerciseConfigTests = ({
  prefix,
  i,
  testConfigs,
  runtimeEnvironments,
  supplementaryFiles,
  pipelines
}) =>
  <div>
    <Table>
      <thead>
        <tr>
          <th />
          <th>
            <FormattedMessage
              id="app.editExerciseConfigForm.pipelines"
              defaultMessage="Pipelines"
            />
          </th>
          <th>
            <FormattedMessage
              id="app.editExerciseConfigForm.variables"
              defaultMessage="Variables"
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
        supplementaryFiles={supplementaryFiles}
        pipelines={pipelines}
      />
    </Table>
  </div>;

EditExerciseConfigTests.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired,
  testConfigs: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.object.isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  pipelines: ImmutablePropTypes.map
};

export default EditExerciseConfigTests;
