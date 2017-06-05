import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-fontawesome';
import DifficultyIcon from '../DifficultyIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';

const GroupExercisesListItem = ({
  id,
  name,
  difficulty,
  authorId,
  createdAt,
  links: { EXERCISE_URI_FACTORY }
}) =>
  <tr>
    <td className="text-center">
      <Icon name="code" />
    </td>
    <td>
      <strong><Link to={EXERCISE_URI_FACTORY(id)}>{name}</Link></strong>
    </td>
    <td>
      <UsersNameContainer userId={authorId} />
    </td>
    <td>
      <DifficultyIcon difficulty={difficulty} />
    </td>
    <td>
      Action {/* @todo */}
    </td>
  </tr>;

GroupExercisesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  links: PropTypes.object
};

export default withLinks(GroupExercisesListItem);
