import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';
import { getLocalizedName } from '../../../helpers/getLocalizedData';

import { MaybeLockedExerciseIcon } from '../../icons';

const ExercisesName = ({
  id,
  name,
  localizedTexts,
  isLocked,
  noLink,
  locale,
  links: { EXERCISE_URI_FACTORY }
}) =>
  <span>
    <MaybeLockedExerciseIcon id={id} isLocked={isLocked} />
    {noLink
      ? <span>
          {getLocalizedName({ name, localizedTexts }, locale)}
        </span>
      : <Link to={EXERCISE_URI_FACTORY(id)}>
          {getLocalizedName({ name, localizedTexts }, locale)}
        </Link>}
  </span>;

ExercisesName.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  isLocked: PropTypes.bool.isRequired,
  noLink: PropTypes.bool,
  links: PropTypes.object,
  locale: PropTypes.string.isRequired
};

export default withLinks(ExercisesName);
