import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';
import { MaybeLockedExerciseIcon } from '../../icons';

const ExercisesName = ({
  id,
  name,
  isLocked,
  noLink,
  links: { EXERCISE_URI_FACTORY }
}) => (
  <span>
    <MaybeLockedExerciseIcon id={id} isLocked={isLocked} />
    {noLink ? (
      <span>{name}</span>
    ) : (
      <Link to={EXERCISE_URI_FACTORY(id)}>{name}</Link>
    )}
  </span>
);

ExercisesName.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isLocked: PropTypes.bool.isRequired,
  noLink: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(ExercisesName);
