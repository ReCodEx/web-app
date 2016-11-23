import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { HelpBlock } from 'react-bootstrap';
import { Field } from 'redux-form';
import { TextField, SourceCodeField, SelectField } from '../Fields';
import { getJsData } from '../../../redux/helpers/resourceManager';

const EditRuntimeConfigFields = ({
  prefix,
  i,
  runtimeConfigs,
  runtimeEnvironments
}) => (
  <div>
    <Field
      name={`${prefix}.name`}
      component={TextField}
      label={<FormattedMessage id='app.editRuntimeConfigForm.configName' defaultMessage='Name of Configuration:' />} />

    <Field
      name={`${prefix}.runtimeEnvironmentId`}
      component={SelectField}
      options={[ { key: '', value: '...' }, ...runtimeEnvironments.map(getJsData).map(env => ({ key: env.id, name: env.name })).toArray() ]}
      label={<FormattedMessage id='app.editRuntimeConfigForm.runtimeEnvironment' defaultMessage='Select runtime environment:' />} />

    <Field
      name={`${prefix}.jobConfig`}
      component={SourceCodeField}
      mode='yaml'
      label={<FormattedMessage id='app.editRuntimeConfigForm.jobConfig' defaultMessage='Job Configuration:' />} />
    <HelpBlock>
      <FormattedHTMLMessage
        id='app.editRuntimeConfigForm.moreAboutJobConfig'
        defaultMessage="Read more about <a href='https://github.com/ReCodEx/wiki/wiki/Assignments#job-configuration'>job configuration</a> syntax." />
    </HelpBlock>
  </div>
);

EditRuntimeConfigFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number,
  runtimeConfigs: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.object.isRequired
};

export default EditRuntimeConfigFields;
