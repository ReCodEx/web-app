import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { TextField, PipelineField } from '../Fields';

const EditPipelineFields = ({ prefix, i, pipelines }) =>
  <div>
    <Field
      name={`${prefix}.name`}
      component={TextField}
      label={
        <FormattedMessage
          id="app.editPipelineFields.pipelineName"
          defaultMessage="Name of the pipeline:"
        />
      }
    />

    <Field
      name={`${prefix}.boxes`}
      component={PipelineField}
      label={
        <FormattedMessage
          id="app.editPipelineFields.pipeline"
          defaultMessage="The pipeline:"
        />
      }
    />
  </div>;

EditPipelineFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number,
  pipelines: PropTypes.array.isRequired
};

export default EditPipelineFields;
