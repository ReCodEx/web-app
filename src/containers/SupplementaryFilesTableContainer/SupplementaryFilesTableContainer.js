import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import FilesTableContainer from '../FilesTableContainer';
import {
  SupplementaryFilesTableHeaderRow,
  SupplementaryFilesTableRow
} from '../../components/Exercises/FilesTable';

import {
  fetchSupplementaryFilesForExercise,
  addSupplementaryFiles,
  removeSupplementaryFile
} from '../../redux/modules/supplementaryFiles';
import { downloadSupplementaryFile } from '../../redux/modules/files';

import { createGetSupplementaryFiles } from '../../redux/selectors/supplementaryFiles';

const SupplementaryFilesTableContainer = ({
  exercise,
  supplementaryFiles,
  loadFiles,
  addFiles,
  removeFile,
  downloadFile
}) =>
  <FilesTableContainer
    uploadId={`supplementary-files-${exercise.id}`}
    attachments={supplementaryFiles}
    loadFiles={loadFiles}
    addFiles={addFiles}
    removeFile={removeFile}
    downloadFile={downloadFile}
    title={
      <FormattedMessage
        id="app.supplementaryFilesTable.title"
        defaultMessage="Supplementary files"
      />
    }
    description={
      <FormattedMessage
        id="app.supplementaryFilesTable.description"
        defaultMessage="Supplementary files are files which can be used in job configuration."
      />
    }
    HeaderComponent={SupplementaryFilesTableHeaderRow}
    RowComponent={SupplementaryFilesTableRow}
  />;

SupplementaryFilesTableContainer.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    supplementaryFilesIds: PropTypes.array.isRequired
  }).isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  loadFiles: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  downloadFile: PropTypes.func.isRequired
};

export default connect(
  (state, { exercise }) => {
    const getSupplementaryFilesForExercise = createGetSupplementaryFiles(
      exercise.supplementaryFilesIds
    );
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(state)
    };
  },
  (dispatch, { exercise }) => ({
    loadFiles: () => dispatch(fetchSupplementaryFilesForExercise(exercise.id)),
    addFiles: files => dispatch(addSupplementaryFiles(exercise.id, files)),
    removeFile: id => dispatch(removeSupplementaryFile(exercise.id, id)),
    downloadFile: (event, id) => {
      event.preventDefault();
      dispatch(downloadSupplementaryFile(id));
    }
  })
)(SupplementaryFilesTableContainer);
