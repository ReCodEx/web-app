import React from 'react';
import PropTypes from 'prop-types';
import DifficultyIcon from '../DifficultyIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';
import { getLocalizedName } from '../../../helpers/getLocalizedData';
import { MaybeLockedExerciseIcon } from '../../icons';

const ExercisesSimpleListItem = ({
  id,
  name,
  difficulty,
  authorId,
  isLocked,
  localizedTexts,
  createActions,
  locale,
  links: { EXERCISE_URI_FACTORY }
}) =>
  <tr>
    <td>
      <MaybeLockedExerciseIcon id={id} isLocked={isLocked} />
      <strong>
        <Link to={EXERCISE_URI_FACTORY(id)}>
          {getLocalizedName({ name, localizedTexts }, locale)}
        </Link>
      </strong>
    </td>
    <td>
      <UsersNameContainer userId={authorId} />
    </td>
    <td>
      <DifficultyIcon difficulty={difficulty} />
    </td>
    {createActions &&
      <td className="text-right">
        {createActions(id, isLocked)}
      </td>}
  </tr>;

ExercisesSimpleListItem.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  isLocked: PropTypes.bool.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  createActions: PropTypes.func,
  locale: PropTypes.string.isRequired,
  links: PropTypes.object
};

export default withLinks(ExercisesSimpleListItem);
