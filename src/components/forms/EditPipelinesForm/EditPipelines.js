import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import EditPipelineFields from './EditPipelineFields';

const EditPipelines = ({ pipelines = [], ...props }) =>
  <TabbedArrayField
    {...props}
    pipelines={pipelines}
    getTitle={i =>
      pipelines && pipelines[i] && pipelines[i].name
        ? pipelines[i].name
        : <FormattedMessage
            id="app.editPipelinesForm.newPipeline"
            defaultMessage="New pipeline"
          />}
    ContentComponent={EditPipelineFields}
    emptyMessage={
      <FormattedMessage
        id="app.editPipelinesForm.emptyPipelines"
        defaultMessage="There is currently no pipeline."
      />
    }
    addMessage={
      <FormattedMessage
        id="app.editPipelinesForm.addPipeline"
        defaultMessage="Add new pipeline"
      />
    }
    removeQuestion={
      <FormattedMessage
        id="app.editPipelinesForm.reallyRemoveQuestion"
        defaultMessage="Do you really want to delete this pipeline?"
      />
    }
    id="pipelines"
    remove
    add
  />;

EditPipelines.propTypes = {
  pipelines: PropTypes.array.isRequired
};

export default EditPipelines;
