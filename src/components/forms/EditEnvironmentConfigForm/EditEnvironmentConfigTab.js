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
  runtimeEnvironments,
  formValues,
  fillDefaultVariablesIfNeeded
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
        onBlur={fillDefaultVariablesIfNeeded(i)}
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
        formValues={
          formValues &&
          formValues.environmentConfigs &&
          formValues.environmentConfigs[i] &&
          formValues.environmentConfigs[i].variablesTable
            ? formValues.environmentConfigs[i].variablesTable
            : []
        }
      />
    </div>
  );
};

EditEnvironmentConfigTab.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired,
  environmentValues: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.object,
  formValues: PropTypes.object,
  fillDefaultVariablesIfNeeded: PropTypes.func
};

export default EditEnvironmentConfigTab;
