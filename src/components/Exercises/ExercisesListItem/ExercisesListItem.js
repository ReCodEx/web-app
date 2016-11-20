import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import DifficultyIcon from '../DifficultyIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';

const ExercisesListItem = ({
  id,
  name,
  difficulty,
  authorId,
  createActions
}, {
  links: { EXERCISE_URI_FACTORY }
}) => (
  <tr>
    <td className='text-center'>
      <Icon name='code' />
    </td>
    <td>
      <strong><Link to={EXERCISE_URI_FACTORY(id)}>{name}</Link></strong>
    </td>
    <td>
      <DifficultyIcon difficulty={difficulty} />
    </td>
    <td>
      <UsersNameContainer userId={authorId} />
    </td>
    {createActions && (
      <td className='text-right'>
        {createActions(id)}
      </td>
    )}
  </tr>
);

ExercisesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  createActions: PropTypes.func
};

ExercisesListItem.contextTypes = {
  links: PropTypes.object
};

export default ExercisesListItem;
