import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field, FieldArray } from 'redux-form';
import { AddIcon, WarningIcon } from '../../Icons';
import { Table } from 'react-bootstrap';
import {
  TextField,
  CheckboxField,
  SelectField,
  TabbedArrayField
} from '../Fields';
import EditHardwareGroupLimits from '../EditHardwareGroupLimits';

const EditEnvironmentLimitsFields = ({ prefix, i, environments }) => {
  const {
    environment,
    hardwareGroups,
    limits
  } = environments[i];
  const { runtimeEnvironment: runtime } = environment;

  return (
    <div>
      <h4>{runtime.name}</h4>
      <ul>
        <li>{runtime.language}</li>
        <li>{runtime.platform}</li>
        <li>{runtime.description}</li>
      </ul>

      <Field
        name={`${prefix}.environment.name`}
        component={TextField}
        label={<FormattedMessage id='app.editEnvironmentLimitsForm.localized.name' defaultMessage='Environment name:' />} />

      <Field
        name={`${prefix}.environment.hardwareGroup`}
        component={SelectField}
        options={hardwareGroups.map(group => ({ key: group, name: group }))}
        label={<FormattedMessage id='app.editEnvironmentLimitsForm.localized.hardwareGroup' defaultMessage='Hardware group:' />} />

      <FieldArray
        name={`${prefix}.limits`}
        limits={limits}
        component={EditHardwareGroupLimits} />
    </div>
  );
};

EditEnvironmentLimitsFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number,
  environments: PropTypes.array.isRequired
};

export default EditEnvironmentLimitsFields;
