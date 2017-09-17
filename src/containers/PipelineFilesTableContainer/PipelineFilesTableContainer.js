import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import AttachedFilesTableContainer from '../AttachedFilesTableContainer';
import {
  SupplementaryFilesTableHeaderRow,
  SupplementaryFilesTableRow
} from '../../components/Exercises/AttachedFilesTable';

import {
  fetchSupplementaryFilesForPipeline,
  addPipelineFiles
} from '../../redux/modules/pipelineFiles';

import { createGetPipelineFiles } from '../../redux/selectors/pipelineFiles';

const PipelineFilesTableContainer = ({
  pipeline,
  supplementaryFiles,
  loadFiles,
  addFiles
}) =>
  <AttachedFilesTableContainer
    uploadId={`supplementary-files-${pipeline.id}`}
    attachments={supplementaryFiles}
    loadFiles={loadFiles}
    addFiles={addFiles}
    title={
      <FormattedMessage
        id="app.pipelineFilesTable.title"
        defaultMessage="Supplementary files"
      />
    }
    description={
      <FormattedMessage
        id="app.pipelineFilesTable.description"
        defaultMessage="Supplementary files are files which can be referenced as remote file in pipeline configuration."
      />
    }
    HeaderComponent={SupplementaryFilesTableHeaderRow}
    RowComponent={SupplementaryFilesTableRow}
  />;

PipelineFilesTableContainer.propTypes = {
  pipeline: PropTypes.shape({
    id: PropTypes.string.isRequired,
    supplementaryFilesIds: PropTypes.array.isRequired
  }).isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  loadFiles: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired
};

export default connect(
  (state, { pipeline }) => {
    const getSupplementaryFilesForPipeline = createGetPipelineFiles(
      pipeline.supplementaryFilesIds
    );
    return {
      supplementaryFiles: getSupplementaryFilesForPipeline(state)
    };
  },
  (dispatch, { pipeline }) => ({
    loadFiles: () => dispatch(fetchSupplementaryFilesForPipeline(pipeline.id)),
    addFiles: files => dispatch(addPipelineFiles(pipeline.id, files))
  })
)(PipelineFilesTableContainer);
