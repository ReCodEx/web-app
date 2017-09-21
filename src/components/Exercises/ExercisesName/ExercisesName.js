import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import withLinks from '../../../hoc/withLinks';

const ExercisesName = ({ id, name, noLink, links: { EXERCISE_URI_FACTORY } }) =>
  <span>
    {noLink
      ? <span>
          {name}
        </span>
      : <Link to={EXERCISE_URI_FACTORY(id)}>
          {name}
        </Link>}
  </span>;

ExercisesName.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  noLink: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(ExercisesName);
