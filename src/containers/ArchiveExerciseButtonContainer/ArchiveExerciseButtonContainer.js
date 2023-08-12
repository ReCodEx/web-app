import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ArchiveExerciseButton from '../../components/buttons/ArchiveExerciseButton';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { setArchived } from '../../redux/modules/exercises';
import { getExercise, getExerciseSetArchivedStatus } from '../../redux/selectors/exercises';

const ArchiveExerciseButtonContainer = ({ exercise = null, setArchived, pending, ...props }) => (
  <ResourceRenderer resource={exercise}>
    {exercise => (
      <ArchiveExerciseButton
        {...props}
        archived={exercise.archivedAt !== null}
        disabled={!exercise.permissionHints.archive}
        setArchived={setArchived}
        pending={pending}
      />
    )}
  </ResourceRenderer>
);

ArchiveExerciseButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  pending: PropTypes.bool,
  exercise: ImmutablePropTypes.map,
  setArchived: PropTypes.func.isRequired,
};

export default connect(
  (state, { id }) => ({
    exercise: getExercise(id)(state),
    pending: getExerciseSetArchivedStatus(state, id),
  }),
  (dispatch, { id }) => ({
    setArchived: archived => dispatch(setArchived(id, archived)),
  })
)(ArchiveExerciseButtonContainer);
