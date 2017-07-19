import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { TextField } from '../Fields';
import EditEnvironmentConfigVariables from './EditEnvironmentConfigVariables';

const EditEnvironmentConfigTab = ({ prefix, i, environmentConfigs }) => (
  <div>
    <Field
      name={`${prefix}.runtimeEnvironmentId`}
      component={TextField}
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
  environmentConfigs: PropTypes.array.isRequired
};

export default EditEnvironmentConfigTab;
