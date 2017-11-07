import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';
import LocalizedExerciseName from '../../helpers/LocalizedExerciseName';

import { MaybeLockedExerciseIcon } from '../../icons';

const ExercisesName = ({
  id,
  name,
  localizedTexts,
  isLocked,
  noLink,
  links: { EXERCISE_URI_FACTORY }
}) =>
  <span>
    <MaybeLockedExerciseIcon id={id} isLocked={isLocked} />
    {noLink
      ? <span>
          <LocalizedExerciseName entity={{ name, localizedTexts }} />
        </span>
      : <Link to={EXERCISE_URI_FACTORY(id)}>
          <LocalizedExerciseName entity={{ name, localizedTexts }} />
        </Link>}
  </span>;

ExercisesName.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  isLocked: PropTypes.bool.isRequired,
  noLink: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(ExercisesName);
