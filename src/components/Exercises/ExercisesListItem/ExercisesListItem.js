import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Icon from 'react-fontawesome';
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
    <td className={classNames({
      'text-center': true,
      'text-success': difficulty === 'easy',
      'text-warning': difficulty === 'moderate',
      'text-danger': difficulty === 'hard'
    })}>
      <Icon name='puzzle-piece' />
    </td>
    <td>
      <strong><Link to={EXERCISE_URI_FACTORY(id)}>{name}</Link></strong>
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
