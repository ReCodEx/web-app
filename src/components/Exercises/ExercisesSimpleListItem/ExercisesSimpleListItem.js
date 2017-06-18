import React from 'react';
import PropTypes from 'prop-types';
import DifficultyIcon from '../DifficultyIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';

const ExercisesSimpleListItem = ({
  id,
  name,
  difficulty,
  authorId,
  createActions,
  links: { EXERCISE_URI_FACTORY }
}) => (
  <tr>
    <td>
      <strong><Link to={EXERCISE_URI_FACTORY(id)}>{name}</Link></strong>
    </td>
    <td>
      <UsersNameContainer userId={authorId} />
    </td>
    <td>
      <DifficultyIcon difficulty={difficulty} />
    </td>
    {createActions &&
      <td>
        {createActions(id)}
      </td>}
  </tr>
);

ExercisesSimpleListItem.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(ExercisesSimpleListItem);
