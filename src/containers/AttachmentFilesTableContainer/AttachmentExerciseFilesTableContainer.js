import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import FilesTableContainer from '../FilesTableContainer';
import {
  AttachmentFilesTableRow,
  AttachmentFilesTableHeaderRow
} from '../../components/Exercises/FilesTable';

import {
  fetchAttachmentExerciseFiles,
  addAttachmentExerciseFiles,
  removeAttachmentExerciseFile
} from '../../redux/modules/attachmentExerciseFiles';

import { createGetAttachmentExerciseFiles } from '../../redux/selectors/attachmentExerciseFiles';

const AttachmentExerciseFilesTableContainer = ({
  exercise,
  attachmentExerciseFiles,
  loadFiles,
  addFiles,
  removeFile
}) =>
  <FilesTableContainer
    uploadId={`attachment-exercise-files-${exercise.id}`}
    attachments={attachmentExerciseFiles}
    loadFiles={loadFiles}
    addFiles={addFiles}
    removeFile={removeFile}
    title={
      <FormattedMessage
        id="app.attachmentExerciseFilesTable.title"
        defaultMessage="Attached files"
      />
    }
    description={
      <FormattedMessage
        id="app.attachmentExerciseFilesTable.description"
        defaultMessage="Attached files are files which can be used within exercise description using links provided below. Attached files can be viewed or downloaded by students."
      />
    }
    HeaderComponent={AttachmentFilesTableHeaderRow}
    RowComponent={AttachmentFilesTableRow}
  />;

AttachmentExerciseFilesTableContainer.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    attachmentExerciseFilesIds: PropTypes.array.isRequired
  }).isRequired,
  attachmentExerciseFiles: ImmutablePropTypes.map,
  loadFiles: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired
};

export default connect(
  (state, { exercise }) => {
    const getAttachmentExerciseFiles = createGetAttachmentExerciseFiles(
      exercise.attachmentExerciseFilesIds
    );
    return {
      attachmentExerciseFiles: getAttachmentExerciseFiles(state)
    };
  },
  (dispatch, { exercise }) => ({
    loadFiles: () => dispatch(fetchAttachmentExerciseFiles(exercise.id)),
    addFiles: files => dispatch(addAttachmentExerciseFiles(exercise.id, files)),
    removeFile: id => dispatch(removeAttachmentExerciseFile(exercise.id, id))
  })
)(AttachmentExerciseFilesTableContainer);
