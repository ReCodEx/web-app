import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import EditEnvironmentConfigTab from './EditEnvironmentConfigTab';

const EditEnvironmentConfigTabs = ({ environmentConfigs, ...props }) => (
  <TabbedArrayField
    {...props}
    environmentConfigs={environmentConfigs}
    getTitle={i =>
      environmentConfigs &&
        environmentConfigs[i] &&
        environmentConfigs[i].runtimeEnvironmentId
        ? environmentConfigs[i].runtimeEnvironmentId
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
  />
);

EditEnvironmentConfigTabs.propTypes = {
  environmentConfigs: PropTypes.array.isRequired
};

export default EditEnvironmentConfigTabs;
