import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';

import SupplementaryFilesTable from '../../components/Exercises/SupplementaryFilesTable';
import { fetchSupplementaryFilesForExercise, addSupplementaryFiles } from '../../redux/modules/supplementaryFiles';
import { createGetSupplementaryFilesForExercise } from '../../redux/selectors/supplementaryFiles';

import { createGetUploadedFiles, createAllUploaded } from '../../redux/selectors/upload';


class SupplementaryFilesTableContainer extends Component {

  static getUploadId = (exerciseId) => `supplementary-files-${exerciseId}`;

  componentWillMount() {
    SupplementaryFilesTableContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.exerciseId !== newProps.exerciseId) {
      SupplementaryFilesTableContainer.loadData(newProps);
    }
  }

  static loadData = ({
    loadSupplementaryFilesForExercise
  }) => {
    loadSupplementaryFilesForExercise();
  };

  render() {
    const {
      exerciseId,
      supplementaryFiles,
      newFiles,
      allUploaded,
      addSupplementaryFiles
    } = this.props;

    return (
      <SupplementaryFilesTable
        uploadId={SupplementaryFilesTableContainer.getUploadId(exerciseId)}
        newFiles={newFiles}
        canSubmit={allUploaded}
        addSupplementaryFiles={addSupplementaryFiles}
        supplementaryFiles={supplementaryFiles} />
    );
  }

}

SupplementaryFilesTableContainer.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  newFiles: ImmutablePropTypes.list,
  allUploaded: PropTypes.bool,
  addSupplementaryFiles: PropTypes.func
};

export default connect(
  (state, { exerciseId }) => {
    const getSupplementaryFilesForExercise = createGetSupplementaryFilesForExercise(exerciseId);
    const uploadId = SupplementaryFilesTableContainer.getUploadId(exerciseId);
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(state),
      newFiles: createGetUploadedFiles(uploadId)(state) || List(),
      allUploaded: createAllUploaded(uploadId)(state)
    };
  },
  (dispatch, { exerciseId }) => ({
    loadSupplementaryFilesForExercise: () => dispatch(fetchSupplementaryFilesForExercise(exerciseId)),
    addSupplementaryFiles: (files) => dispatch(addSupplementaryFiles(exerciseId, files.toJS().map(uploaded => uploaded.file.id)))
  })
)(SupplementaryFilesTableContainer);
