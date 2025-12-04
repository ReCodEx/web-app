import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import FilesTableContainer from '../FilesTableContainer';
import { ExerciseFilesTableHeaderRow, ExerciseFilesTableRow } from '../../components/Exercises/FilesTable';
import { InfoIcon } from '../../components/icons/index.js';

import {
  fetchFilesForExercise,
  addExerciseFiles,
  removeExerciseFile,
  downloadExerciseFilesArchive,
} from '../../redux/modules/exerciseFiles.js';
import { download } from '../../redux/modules/files.js';
import { fetchExerciseFileLinks, fetchExerciseFileLinksIfNeeded } from '../../redux/modules/exerciseFilesLinks.js';
import { getFilesForExercise, fetchFilesForExerciseStatus } from '../../redux/selectors/exerciseFiles.js';
import { getExerciseFilesLinks } from '../../redux/selectors/exerciseFilesLinks.js';

import { isReadyOrReloading, getJsData } from '../../redux/helpers/resourceManager';

const createFilesLinksIndex = lruMemoize(filesLinks =>
  isReadyOrReloading(filesLinks) ? new Set(Object.values(getJsData(filesLinks)).map(link => link.exerciseFileId)) : null
);

const ExerciseFilesTableContainer = ({
  exercise,
  exerciseFiles,
  exerciseFilesStatus,
  exerciseFilesLinks,
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
      <>
        <InfoIcon gapRight={2} className="opacity-50" />
        <FormattedMessage
          id="app.exerciseFilesTable.description"
          defaultMessage="Exercise files can be used in exercise configuration (as input files, expected output files, extra compilation files, custom judges, ...). Links to exercise files can also be created and then used in exercise texts (specification for students, description)."
        />
      </>
    }
    HeaderComponent={ExerciseFilesTableHeaderRow}
    RowComponent={ExerciseFilesTableRow}
    viewOnly={!exercise.permissionHints.update}
    downloadArchive={downloadArchive}
    linkedFilesIds={createFilesLinksIndex(exerciseFilesLinks)}
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
  exerciseFilesLinks: PropTypes.array,
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
      exerciseFilesLinks: getExerciseFilesLinks(state, exercise.id),
    };
  },
  (dispatch, { exercise }) => ({
    loadFiles: () =>
      Promise.all([
        dispatch(fetchFilesForExercise(exercise.id)),
        dispatch(fetchExerciseFileLinksIfNeeded(exercise.id)),
      ]),
    addFiles: files =>
      dispatch(addExerciseFiles(exercise.id, files)).then(() => dispatch(fetchExerciseFileLinks(exercise.id))),
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
