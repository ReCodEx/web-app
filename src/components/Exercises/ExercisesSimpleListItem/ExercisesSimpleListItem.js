import React from 'react';
import PropTypes from 'prop-types';
import DifficultyIcon from '../DifficultyIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';
import { MaybeLockedExerciseIcon } from '../../icons';

import { getLocalizedName } from '../../../helpers/localizedTexts';

const ExercisesSimpleListItem = (
  {
    id,
    name,
    localizedTexts,
    difficulty,
    authorId,
    isLocked,
    createActions,
    links: { EXERCISE_URI_FACTORY }
  },
  { lang }
) =>
  <tr>
    <td>
      <MaybeLockedExerciseIcon id={id} isLocked={isLocked} />
      <strong>
        <Link to={EXERCISE_URI_FACTORY(id)}>
          {getLocalizedName(localizedTexts, lang, name)}
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
  localizedTexts: PropTypes.array.isRequired,
  difficulty: PropTypes.string.isRequired,
  isLocked: PropTypes.bool.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object
};

ExercisesSimpleListItem.contextTypes = {
  lang: PropTypes.string.isRequired
};

export default withLinks(ExercisesSimpleListItem);
