import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import AttachedFilesTableContainer from '../AttachedFilesTableContainer';
import {
  AdditionalFilesTableRow,
  AdditionalFilesTableHeaderRow
} from '../../components/Exercises/AttachedFilesTable';

import {
  fetchAdditionalExerciseFiles,
  addAdditionalExerciseFiles,
  removeAdditionalExerciseFile
} from '../../redux/modules/additionalExerciseFiles';

import { createGetAdditionalExerciseFiles } from '../../redux/selectors/additionalExerciseFiles';

const AdditionalExerciseFilesTableContainer = ({
  exercise,
  additionalExerciseFiles,
  loadFiles,
  addFiles,
  removeFile
}) =>
  <AttachedFilesTableContainer
    uploadId={`additional-exercise-files-${exercise.id}`}
    attachments={additionalExerciseFiles}
    loadFiles={loadFiles}
    addFiles={addFiles}
    removeFile={removeFile}
    title={
      <FormattedMessage
        id="app.additionalExerciseFilesTable.title"
        defaultMessage="Additional exercise files"
      />
    }
    description={
      <FormattedMessage
        id="app.additionalExerciseFilesTable.description"
        defaultMessage="Additional exercise files are files which can be used within exercise description using links provided below. Additional files can be viewed or downloaded by students."
      />
    }
    HeaderComponent={AdditionalFilesTableHeaderRow}
    RowComponent={AdditionalFilesTableRow}
  />;

AdditionalExerciseFilesTableContainer.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    additionalExerciseFilesIds: PropTypes.array.isRequired
  }).isRequired,
  additionalExerciseFiles: ImmutablePropTypes.map,
  loadFiles: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired
};

export default connect(
  (state, { exercise }) => {
    const getAdditionalExerciseFiles = createGetAdditionalExerciseFiles(
      exercise.additionalExerciseFilesIds
    );
    return {
      additionalExerciseFiles: getAdditionalExerciseFiles(state)
    };
  },
  (dispatch, { exercise }) => ({
    loadFiles: () => dispatch(fetchAdditionalExerciseFiles(exercise.id)),
    addFiles: files => dispatch(addAdditionalExerciseFiles(exercise.id, files)),
    removeFile: id => dispatch(removeAdditionalExerciseFile(exercise.id, id))
  })
)(AdditionalExerciseFilesTableContainer);
