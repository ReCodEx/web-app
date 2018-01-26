import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';

import { ExercisePrefixIcons } from '../../icons';

const ExercisesName = ({
  id,
  name,
  localizedTexts,
  isLocked,
  isBroken,
  validationError,
  noLink,
  links: { EXERCISE_URI_FACTORY }
}) =>
  <span>
    <ExercisePrefixIcons
      id={id}
      isLocked={isLocked}
      isBroken={isBroken}
      validationError={validationError}
    />
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
  isBroken: PropTypes.bool.isRequired,
  validationError: PropTypes.string,
  noLink: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(ExercisesName);
