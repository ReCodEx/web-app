import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import FilesTableContainer from '../FilesTableContainer';
import { SupplementaryFilesTableHeaderRow, SupplementaryFilesTableRow } from '../../components/Exercises/FilesTable';

import {
  fetchSupplementaryFilesForPipeline,
  addPipelineFiles,
  removePipelineFile,
} from '../../redux/modules/pipelineFiles';
import { downloadSupplementaryFile } from '../../redux/modules/files';

import { getSupplementaryFilesForPipeline } from '../../redux/selectors/pipelineFiles';

const PipelineFilesTableContainer = ({
  pipeline,
  supplementaryFiles,
  loadFiles,
  addFiles,
  removeFile,
  downloadFile,
}) => (
  <FilesTableContainer
    uploadId={`pipeline-files-${pipeline.id}`}
    attachments={supplementaryFiles}
    loadFiles={loadFiles}
    addFiles={addFiles}
    removeFile={removeFile}
    downloadFile={downloadFile}
    title={<FormattedMessage id="app.pipelineFilesTable.title" defaultMessage="Supplementary files" />}
    description={
      <FormattedMessage
        id="app.pipelineFilesTable.description"
        defaultMessage="Supplementary files are files which can be referenced as remote file in pipeline configuration."
      />
    }
    HeaderComponent={SupplementaryFilesTableHeaderRow}
    RowComponent={SupplementaryFilesTableRow}
  />
);

PipelineFilesTableContainer.propTypes = {
  pipeline: PropTypes.shape({
    id: PropTypes.string.isRequired,
    supplementaryFilesIds: PropTypes.array.isRequired,
  }).isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  loadFiles: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  downloadFile: PropTypes.func.isRequired,
};

export default connect(
  (state, { pipeline }) => {
    return {
      supplementaryFiles: getSupplementaryFilesForPipeline(pipeline.id)(state),
    };
  },
  (dispatch, { pipeline }) => ({
    loadFiles: () => dispatch(fetchSupplementaryFilesForPipeline(pipeline.id)),
    addFiles: files => dispatch(addPipelineFiles(pipeline.id, files)),
    removeFile: id => dispatch(removePipelineFile(pipeline.id, id)),
    downloadFile: (ev, id) => {
      ev.preventDefault();
      dispatch(downloadSupplementaryFile(id));
    },
  })
)(PipelineFilesTableContainer);
