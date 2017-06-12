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
  fetchSupplementaryFilesForExercise,
  addSupplementaryFiles
} from '../../redux/modules/supplementaryFiles';

import { createGetSupplementaryFiles } from '../../redux/selectors/supplementaryFiles';

const SupplementaryFilesTableContainer = ({
  exercise,
  supplementaryFiles,
  loadFiles,
  addFiles
}) =>
  <AttachedFilesTableContainer
    uploadId={`supplementary-files-${exercise.id}`}
    attachments={supplementaryFiles}
    loadFiles={loadFiles}
    addFiles={addFiles}
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
  addFiles: PropTypes.func.isRequired
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
    addFiles: files => dispatch(addSupplementaryFiles(exercise.id, files))
  })
)(SupplementaryFilesTableContainer);
