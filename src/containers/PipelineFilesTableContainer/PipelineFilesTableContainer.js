import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import FilesTableContainer from '../FilesTableContainer';
import { ExerciseFilesTableHeaderRow, ExerciseFilesTableRow } from '../../components/Exercises/FilesTable';

import {
  fetchExerciseFilesForPipeline,
  addPipelineFiles,
  removePipelineFile,
} from '../../redux/modules/pipelineFiles.js';
import { download } from '../../redux/modules/files.js';

import { getExerciseFilesForPipeline } from '../../redux/selectors/pipelineFiles.js';

const PipelineFilesTableContainer = ({ pipeline, exerciseFiles, loadFiles, addFiles, removeFile, downloadFile }) => (
  <FilesTableContainer
    uploadId={`pipeline-files-${pipeline.id}`}
    files={exerciseFiles}
    loadFiles={loadFiles}
    addFiles={addFiles}
    removeFile={removeFile}
    downloadFile={downloadFile}
    title={<FormattedMessage id="app.pipelineFilesTable.title" defaultMessage="Pipeline files" />}
    description={
      <FormattedMessage
        id="app.pipelineFilesTable.description"
        defaultMessage="Additional files which can be referenced as remote file in pipeline configuration."
      />
    }
    HeaderComponent={ExerciseFilesTableHeaderRow}
    RowComponent={ExerciseFilesTableRow}
  />
);

PipelineFilesTableContainer.propTypes = {
  pipeline: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filesIds: PropTypes.array.isRequired,
  }).isRequired,
  exerciseFiles: ImmutablePropTypes.map,
  loadFiles: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  downloadFile: PropTypes.func.isRequired,
};

export default connect(
  (state, { pipeline }) => {
    return {
      exerciseFiles: getExerciseFilesForPipeline(pipeline.id)(state),
    };
  },
  (dispatch, { pipeline }) => ({
    loadFiles: () => dispatch(fetchExerciseFilesForPipeline(pipeline.id)),
    addFiles: files => dispatch(addPipelineFiles(pipeline.id, files)),
    removeFile: id => dispatch(removePipelineFile(pipeline.id, id)),
    downloadFile: (ev, id) => {
      ev.preventDefault();
      dispatch(download(id));
    },
  })
)(PipelineFilesTableContainer);
