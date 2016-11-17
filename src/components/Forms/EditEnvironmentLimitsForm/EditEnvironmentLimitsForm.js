import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import EditEnvironmentLimitsFields from './EditEnvironmentLimitsFields';

const EditEnvironmentLimitsForm = ({
  environments = [],
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

EditEnvironmentLimitsForm.propTypes = {
  environments: PropTypes.array
};

export default EditEnvironmentLimitsForm;
