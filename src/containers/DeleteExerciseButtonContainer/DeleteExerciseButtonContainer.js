import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { deleteExercise } from '../../redux/modules/exercises';
import { getExercise } from '../../redux/selectors/exercises';

const DeleteExerciseButtonContainer = ({
  exercise,
  deleteExercise,
  onDeleted,
  ...props
}) =>
  <DeleteButton
    {...props}
    resource={exercise}
    deleteResource={deleteExercise}
  />;

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
    deleteExercise: () => {
      onDeleted && onDeleted();
      return dispatch(deleteExercise(id));
    }
  })
)(DeleteExerciseButtonContainer);
