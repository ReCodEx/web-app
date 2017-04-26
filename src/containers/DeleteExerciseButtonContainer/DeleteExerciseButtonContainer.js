import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { deleteExercise } from '../../redux/modules/exercises';
import { getExercise } from '../../redux/selectors/exercises';

const DeleteExerciseButtonContainer = (
  {
    exercise,
    deleteExercise,
    onDeleted,
    ...props
  }
) => /* The button is temporarily disabled - becouse the API is not implemented yet.  */
(
  <DeleteButton
    {...props}
    resource={exercise}
    deleteResource={deleteExercise}
    disabled
    title="Deleting exercises is not implemented yet."
  />
);

DeleteExerciseButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  exercise: ImmutablePropTypes.map,
  deleteExercise: PropTypes.func.isRequired,
  onDeleted: PropTypes.func
};

export default connect(
  (state, { id }) => ({
    exercise: getExercise(id)(state)
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteExercise: () =>
      dispatch(deleteExercise(id)).then(() => onDeleted && onDeleted())
  })
)(DeleteExerciseButtonContainer);
