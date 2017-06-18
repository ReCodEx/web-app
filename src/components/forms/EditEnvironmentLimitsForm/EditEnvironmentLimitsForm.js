import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import EditEnvironmentLimitsFields from './EditEnvironmentLimitsFields';

const EditEnvironmentLimitsForm = ({
  environments = [],
  runtimeEnvironments,
  ...props
}) => (
  <TabbedArrayField
    {...props}
    environments={environments}
    getTitle={i =>
      environments && environments[i]
        ? environments[i].environment.name
        : <FormattedMessage
            id="app.editEnvironmentLimitsForm.newEnvironment"
            defaultMessage="New environment"
          />}
    ContentComponent={EditEnvironmentLimitsFields}
    runtimeEnvironments={runtimeEnvironments}
    removeQuestion={
      <FormattedMessage
        id="app.editEnvironmentLimitsForm.environment.noEnvironment"
        defaultMessage="There is currently no environment specified for this assignment."
      />
    }
    id="environment-limits"
    remove
  />
);

EditEnvironmentLimitsForm.propTypes = {
  environments: PropTypes.array,
  runtimeEnvironments: ImmutablePropTypes.map
};

export default EditEnvironmentLimitsForm;
