import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field, FieldArray } from 'redux-form';
import { Alert, Button, Tabs, Tab } from 'react-bootstrap';
import Confirm from '../Confirm';
import { AddIcon, WarningIcon } from '../../Icons';
import {
  TextField,
  CheckboxField,
  SelectField,
  TabbedArrayField
} from '../Fields';
import EditEnvironmentLimitsFields from './EditEnvironmentLimitsFields';

const EditEnvironmentLimitsForm = ({
  environments,
  ...props
}) => (
  <TabbedArrayField
    {...props}
    environments={environments}
    getTitle={
      (i) => (environments && environments[i])
        ? environments[i].environment.name
        : <FormattedMessage id='app.editEnvironmentLimitsForm.newLocale' defaultMessage='New environment' />
    }
    ContentComponent={EditEnvironmentLimitsFields}
    removeQuestion={<FormattedMessage id='app.editEnvironmentLimitsForm.localized.noEnvironment' defaultMessage='There is currently no environment specified for this assignment.' />}
    id='environment-limits'
    remove />
);

export default EditEnvironmentLimitsForm;
