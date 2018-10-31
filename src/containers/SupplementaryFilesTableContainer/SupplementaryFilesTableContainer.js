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
  removeSupplementaryFile,
  downloadSupplementaryArchive
} from '../../redux/modules/supplementaryFiles';
import { downloadSupplementaryFile } from '../../redux/modules/files';

import { getSupplementaryFilesForExercise } from '../../redux/selectors/supplementaryFiles';

const SupplementaryFilesTableContainer = ({
  exercise,
  supplementaryFiles,
  loadFiles,
  addFiles,
  removeFile,
  downloadFile,
  downloadArchive,
  ...props
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
        defaultMessage="Supplementary Files"
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
    viewOnly={!exercise.permissionHints.update}
    downloadArchive={downloadArchive}
    {...props}
  />;

SupplementaryFilesTableContainer.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    supplementaryFilesIds: PropTypes.array.isRequired,
    permissionHints: PropTypes.object.isRequired
  }).isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  loadFiles: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  downloadFile: PropTypes.func.isRequired,
  downloadArchive: PropTypes.func
};

export default connect(
  (state, { exercise }) => {
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(exercise.id)(state)
    };
  },
  (dispatch, { exercise }) => ({
    loadFiles: () => dispatch(fetchSupplementaryFilesForExercise(exercise.id)),
    addFiles: files => dispatch(addSupplementaryFiles(exercise.id, files)),
    removeFile: id => dispatch(removeSupplementaryFile(exercise.id, id)),
    downloadFile: (ev, id) => {
      ev.preventDefault();
      dispatch(downloadSupplementaryFile(id));
    },
    downloadArchive: e => {
      e.preventDefault();
      dispatch(downloadSupplementaryArchive(exercise.id));
    }
  })
)(SupplementaryFilesTableContainer);
