import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import ConfirmDeleteButton from '../../components/buttons/DeleteButton/ConfirmDeleteButton';
import { deleteExercise } from '../../redux/modules/exercises';
import { getExercise } from '../../redux/selectors/exercises';

const DeleteExerciseButtonContainer = ({ resourceless = false, exercise, deleteExercise, onDeleted, ...props }) =>
  resourceless ? (
    <ConfirmDeleteButton {...props} onClick={deleteExercise} />
  ) : (
    <DeleteButton {...props} resource={exercise} deleteResource={deleteExercise} />
  );

DeleteExerciseButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  resourceless: PropTypes.bool,
  exercise: ImmutablePropTypes.map,
  deleteExercise: PropTypes.func.isRequired,
  onDeleted: PropTypes.func,
};

export default connect(
  (state, { id }) => ({
    exercise: getExercise(id)(state),
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteExercise: () => {
      const promise = dispatch(deleteExercise(id));
      if (onDeleted) {
        promise.then(onDeleted);
      }
      return promise;
    },
  })
)(DeleteExerciseButtonContainer);
