import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import EditRuntimeConfigFields from './EditRuntimeConfigFields';

const EditRuntimeConfigForm = (
  {
    runtimeConfigs = [],
    runtimeEnvironments,
    ...props
  }
) => (
  <TabbedArrayField
    {...props}
    runtimeConfigs={runtimeConfigs}
    runtimeEnvironments={runtimeEnvironments}
    getTitle={i =>
      runtimeConfigs && runtimeConfigs[i] && runtimeConfigs[i].name
        ? runtimeConfigs[i].name
        : <FormattedMessage
            id="app.editRuntimeConfigForm.newConfig"
            defaultMessage="New configuration"
          />}
    ContentComponent={EditRuntimeConfigFields}
    emptyMessage={
      <FormattedMessage
        id="app.editRuntimeConfigForm.emptyConfigTabs"
        defaultMessage="There is currently no runtime configuration."
      />
    }
    addMessage={
      <FormattedMessage
        id="app.editRuntimeConfigForm.addConfigTab"
        defaultMessage="Add new runtime configuration"
      />
    }
    removeQuestion={
      <FormattedMessage
        id="app.editRuntimeConfigForm.reallyRemoveQuestion"
        defaultMessage="Do you really want to delete this runtime configuration?"
      />
    }
    id="runtime-configuration"
    remove
    add
  />
);

EditRuntimeConfigForm.propTypes = {
  runtimeConfigs: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.object.isRequired
};

export default EditRuntimeConfigForm;
