import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import FilesTableContainer from '../FilesTableContainer';
import { ExerciseFilesTableHeaderRow, ExerciseFilesTableRow } from '../../components/Exercises/FilesTable';

import {
  fetchFilesForExercise,
  addExerciseFiles,
  removeExerciseFile,
  downloadExerciseFilesArchive,
} from '../../redux/modules/exerciseFiles.js';
import { download } from '../../redux/modules/files.js';
import { getFilesForExercise, fetchFilesForExerciseStatus } from '../../redux/selectors/exerciseFiles.js';

const ExerciseFilesTableContainer = ({
  exercise,
  exerciseFiles,
  exerciseFilesStatus,
  usedFiles,
  loadFiles,
  addFiles,
  removeFile,
  downloadFile,
  downloadArchive,
  ...props
}) => (
  <FilesTableContainer
    uploadId={`exercise-files-${exercise.id}`}
    files={exerciseFiles}
    usedFiles={usedFiles}
    loadFiles={loadFiles}
    fetchFilesStatus={exerciseFilesStatus}
    addFiles={addFiles}
    removeFile={removeFile}
    downloadFile={downloadFile}
    title={<FormattedMessage id="app.exerciseFilesTable.title" defaultMessage="Exercise Files" />}
    description={
      <FormattedMessage
        id="app.exerciseFilesTable.description"
        defaultMessage="Exercise files are files which can be used in exercise configuration (as input files, expected output files, extra compilation files, custom judges, ...)."
      />
    }
    HeaderComponent={ExerciseFilesTableHeaderRow}
    RowComponent={ExerciseFilesTableRow}
    viewOnly={!exercise.permissionHints.update}
    downloadArchive={downloadArchive}
    {...props}
  />
);

ExerciseFilesTableContainer.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filesIds: PropTypes.array.isRequired,
    permissionHints: PropTypes.object.isRequired,
  }).isRequired,
  exerciseFiles: ImmutablePropTypes.map,
  exerciseFilesStatus: PropTypes.string,
  usedFiles: PropTypes.instanceOf(Set),
  loadFiles: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  downloadFile: PropTypes.func.isRequired,
  downloadArchive: PropTypes.func,
};

export default connect(
  (state, { exercise }) => {
    return {
      exerciseFiles: getFilesForExercise(exercise.id)(state),
      exerciseFilesStatus: fetchFilesForExerciseStatus(state)(exercise.id),
    };
  },
  (dispatch, { exercise }) => ({
    loadFiles: () => dispatch(fetchFilesForExercise(exercise.id)),
    addFiles: files => dispatch(addExerciseFiles(exercise.id, files)),
    removeFile: id => dispatch(removeExerciseFile(exercise.id, id)),
    downloadFile: (ev, id) => {
      ev.preventDefault();
      dispatch(download(id));
    },
    downloadArchive: e => {
      e.preventDefault();
      dispatch(downloadExerciseFilesArchive(exercise.id));
    },
  })
)(ExerciseFilesTableContainer);
