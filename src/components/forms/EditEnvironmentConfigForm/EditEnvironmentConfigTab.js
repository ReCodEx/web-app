import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { SelectField } from '../Fields';
import EditEnvironmentConfigVariables from './EditEnvironmentConfigVariables';

const EditEnvironmentConfigTab = ({
  prefix,
  i,
  environmentValues,
  runtimeEnvironments
}) => {
  if (!environmentValues[i]) {
    environmentValues[i] = {
      runtimeEnvironmentId: '',
      variablesTable: []
    };
  }
  return (
    <div>
      <Field
        name={`${prefix}.runtimeEnvironmentId`}
        component={SelectField}
        options={[{ key: '', name: '...' }].concat(
          Object.keys(runtimeEnvironments.toJS()).map(key => ({
            key,
            name: runtimeEnvironments.toJS()[key].data.name
          }))
        )}
        label={
          <FormattedMessage
            id="app.editEnvironmentConfigTab.runtimeEnvironment"
            defaultMessage="Runtime environment:"
          />
        }
      />
      <FieldArray
        name={`${prefix}.variablesTable`}
        component={EditEnvironmentConfigVariables}
        environment={environmentValues[i]}
        prefix={`${prefix}.variablesTable`}
      />
    </div>
  );
};

EditEnvironmentConfigTab.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired,
  environmentValues: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.object
};

export default EditEnvironmentConfigTab;
