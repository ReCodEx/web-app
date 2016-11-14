import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import EditRuntimeConfigFields from './EditRuntimeConfigFields';

const EditRuntimeConfigForm = ({
  runtimeConfigs = [],
  ...props
}) => (
  <TabbedArrayField
    {...props}
    runtimeConfigs={runtimeConfigs}
    getTitle={
      (i) => (runtimeConfigs && runtimeConfigs[i])
        ? runtimeConfigs[i].name
        : <FormattedMessage id='app.editRuntimeConfigForm.newConfig' defaultMessage='New configuration' />
    }
    ContentComponent={EditRuntimeConfigFields}
    removeQuestion={<FormattedMessage id='app.editRuntimeConfigForm.noConfiguration' defaultMessage='There is currently no runtime configuration specified for this exercise.' />}
    id='runtime-configuration'
    remove />
);

EditRuntimeConfigForm.propTypes = {
  runtimeConfigs: PropTypes.array
};

export default EditRuntimeConfigForm;
