import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import EditEnvironmentConfigTab from './EditEnvironmentConfigTab';

const EditEnvironmentConfigTabs = ({ environmentValues, ...props }) =>
  <TabbedArrayField
    {...props}
    environmentValues={environmentValues}
    getTitle={i =>
      environmentValues &&
        environmentValues[i] &&
        environmentValues[i].runtimeEnvironmentId
        ? environmentValues[i].runtimeEnvironmentId
        : <FormattedMessage
            id="app.editEnvironmentConfigTabs.newConfig"
            defaultMessage="New configuration"
          />}
    ContentComponent={EditEnvironmentConfigTab}
    emptyMessage={
      <FormattedMessage
        id="app.editEnvironmentConfigTabs.emptyConfigTabs"
        defaultMessage="There is currently no environment configuration."
      />
    }
    addMessage={
      <FormattedMessage
        id="app.editEnvironmentConfigTabs.addConfigTab"
        defaultMessage="Add new environment configuration"
      />
    }
    removeQuestion={
      <FormattedMessage
        id="app.editEnvironmentConfigTabs.reallyRemoveQuestion"
        defaultMessage="Do you really want to delete this environment configuration?"
      />
    }
    id="environment-config-tabs"
    add
    remove
  />;

EditEnvironmentConfigTabs.propTypes = {
  environmentValues: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.object
};

export default EditEnvironmentConfigTabs;
