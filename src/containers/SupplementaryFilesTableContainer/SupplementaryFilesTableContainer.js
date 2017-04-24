import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';

import SupplementaryFilesTable
  from '../../components/Exercises/SupplementaryFilesTable';
import {
  fetchSupplementaryFilesForExercise,
  addSupplementaryFiles
} from '../../redux/modules/supplementaryFiles';
import {
  createGetSupplementaryFiles
} from '../../redux/selectors/supplementaryFiles';

import { reset } from '../../redux/modules/upload';
import {
  createGetUploadedFiles,
  createAllUploaded
} from '../../redux/selectors/upload';

class SupplementaryFilesTableContainer extends Component {
  static getUploadId = exerciseId => `supplementary-files-${exerciseId}`;

  componentWillMount() {
    SupplementaryFilesTableContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.exercise.id !== newProps.exercise.id) {
      SupplementaryFilesTableContainer.loadData(newProps);
    }
  }

  static loadData = (
    {
      loadSupplementaryFilesForExercise
    }
  ) => {
    loadSupplementaryFilesForExercise();
  };

  render() {
    const {
      exercise,
      supplementaryFiles,
      newFiles,
      allUploaded,
      addSupplementaryFiles
    } = this.props;

    return (
      <SupplementaryFilesTable
        uploadId={SupplementaryFilesTableContainer.getUploadId(exercise.id)}
        newFiles={newFiles}
        canSubmit={allUploaded}
        addSupplementaryFiles={addSupplementaryFiles}
        supplementaryFiles={supplementaryFiles}
      />
    );
  }
}

SupplementaryFilesTableContainer.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    supplementaryFilesIds: PropTypes.array.isRequired
  }).isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  newFiles: ImmutablePropTypes.list,
  allUploaded: PropTypes.bool,
  addSupplementaryFiles: PropTypes.func
};

export default connect(
  (state, { exercise }) => {
    const getSupplementaryFilesForExercise = createGetSupplementaryFiles(
      exercise.supplementaryFilesIds
    );
    const uploadId = SupplementaryFilesTableContainer.getUploadId(exercise.id);
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(state),
      newFiles: createGetUploadedFiles(uploadId)(state) || List(),
      allUploaded: createAllUploaded(uploadId)(state)
    };
  },
  (dispatch, { exercise }) => ({
    loadSupplementaryFilesForExercise: () =>
      dispatch(fetchSupplementaryFilesForExercise(exercise.id)),
    addSupplementaryFiles: files =>
      dispatch(addSupplementaryFiles(exercise.id, files.toJS())).then(
        dispatch(
          reset(SupplementaryFilesTableContainer.getUploadId(exercise.id))
        )
      )
  })
)(SupplementaryFilesTableContainer);
