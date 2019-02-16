import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import FilesTableContainer from '../FilesTableContainer';
import { AttachmentFilesTableRow, AttachmentFilesTableHeaderRow } from '../../components/Exercises/FilesTable';

import {
  fetchAttachmentFiles,
  addAttachmentFiles,
  removeAttachmentFile,
  downloadAttachmentArchive,
} from '../../redux/modules/attachmentFiles';

import { getAttachmentFilesForExercise } from '../../redux/selectors/attachmentFiles';

const AttachmentFilesTableContainer = ({
  exercise,
  attachmentFiles,
  loadFiles,
  addFiles,
  removeFile,
  downloadArchive,
}) => (
  <FilesTableContainer
    uploadId={`attachment-exercise-files-${exercise.id}`}
    attachments={attachmentFiles}
    loadFiles={loadFiles}
    addFiles={addFiles}
    removeFile={removeFile}
    title={<FormattedMessage id="app.attachmentFilesTable.title" defaultMessage="Attached files" />}
    description={
      <FormattedMessage
        id="app.attachmentFilesTable.description"
        defaultMessage="Attached files are files which can be used within exercise description using links provided below. Attached files can be viewed or downloaded by students."
      />
    }
    HeaderComponent={AttachmentFilesTableHeaderRow}
    RowComponent={AttachmentFilesTableRow}
    downloadArchive={downloadArchive}
  />
);

AttachmentFilesTableContainer.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    attachmentFilesIds: PropTypes.array.isRequired,
  }).isRequired,
  attachmentFiles: ImmutablePropTypes.map,
  loadFiles: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
  downloadArchive: PropTypes.func,
};

export default connect(
  (state, { exercise }) => {
    return {
      attachmentFiles: getAttachmentFilesForExercise(exercise.id)(state),
    };
  },
  (dispatch, { exercise }) => ({
    loadFiles: () => dispatch(fetchAttachmentFiles(exercise.id)),
    addFiles: files => dispatch(addAttachmentFiles(exercise.id, files)),
    removeFile: id => dispatch(removeAttachmentFile(exercise.id, id)),
    downloadArchive: e => {
      e.preventDefault();
      dispatch(downloadAttachmentArchive(exercise.id));
    },
  })
)(AttachmentFilesTableContainer);
