import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import withLinks from '../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';

import { ExercisePrefixIcons } from '../../icons';

const ExercisesName = ({
  id,
  name,
  localizedTexts,
  isPublic,
  isLocked,
  isBroken,
  hasReferenceSolutions,
  noLink,
  links: { EXERCISE_URI_FACTORY },
}) => (
  <span>
    <ExercisePrefixIcons
      id={id}
      isPublic={isPublic}
      isLocked={isLocked}
      isBroken={isBroken}
      hasReferenceSolutions={hasReferenceSolutions}
    />
    {noLink ? (
      <span>
        <LocalizedExerciseName entity={{ name, localizedTexts }} />
      </span>
    ) : (
      <Link to={EXERCISE_URI_FACTORY(id)}>
        <LocalizedExerciseName entity={{ name, localizedTexts }} />
      </Link>
    )}
  </span>
);

ExercisesName.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  isPublic: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isBroken: PropTypes.bool.isRequired,
  hasReferenceSolutions: PropTypes.bool.isRequired,
  noLink: PropTypes.bool,
  links: PropTypes.object,
};

export default withLinks(ExercisesName);
