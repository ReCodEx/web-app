import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field, FieldArray } from 'redux-form';
import { TextField, SourceCodeField, SelectField } from '../Fields';

const EditRuntimeConfigFields = ({ prefix, i, runtimeConfigs }) => {

  const runtimeConfig = runtimeConfigs[i];

  return (
    <div>
      <Field
        name={`${prefix}.customName`}
        component={TextField}
        label={<FormattedMessage id='app.editRuntimeConfigForm.configName' defaultMessage='Name of Configuration:' />} />

      <Field
        name={`${prefix}.runtimeEnvironmentId`}
        component={SelectField}
        options={[]} // TODO: get environments from api
        label={<FormattedMessage id='app.editRuntimeConfigForm.runtimeEnvironment' defaultMessage='Select runtime environment:' />} />

      <Field
        name={`${prefix}.jobConfig`}
        component={SourceCodeField}
        mode='yaml'
        label={<FormattedMessage id='app.editRuntimeConfigForm.jobConfig' defaultMessage='Job Configuration:' />} />
    </div>
  );
};

EditRuntimeConfigFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number,
  runtimeConfigs: PropTypes.array.isRequired
};

export default EditRuntimeConfigFields;
