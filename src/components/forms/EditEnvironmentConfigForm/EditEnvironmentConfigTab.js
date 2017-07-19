import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { SelectField } from '../Fields';
import EditEnvironmentConfigVariables from './EditEnvironmentConfigVariables';

const EditEnvironmentConfigTab = ({
  prefix,
  i,
  environmentConfigs,
  runtimeEnvironments
}) => (
  <div>
    <Field
      name={`${prefix}.runtimeEnvironmentId`}
      component={SelectField}
      options={Object.keys(runtimeEnvironments.toJS()).map(key => ({
        key,
        name: runtimeEnvironments.toJS()[key].data.name
      }))}
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
      variables={
        environmentConfigs[i] && environmentConfigs[i].variablesTable
          ? environmentConfigs[i].variablesTable
          : []
      }
      prefix={`${prefix}.variablesTable`}
    />
  </div>
);

EditEnvironmentConfigTab.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired,
  environmentConfigs: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.object
};

export default EditEnvironmentConfigTab;
