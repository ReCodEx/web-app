import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-fontawesome';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import DifficultyIcon from '../DifficultyIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';

const ExercisesListItem = ({
  id,
  name,
  difficulty,
  authorId,
  groupId,
  createdAt,
  createActions,
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
      {groupId
        ? <GroupsNameContainer groupId={groupId} />
        : <i>
            <FormattedMessage
              id="app.exercisesListItem.group.public"
              defaultMessage="Public"
            />
          </i>}
    </td>
    <td>
      <DifficultyIcon difficulty={difficulty} />
    </td>
    <td>
      <FormattedDate value={createdAt * 1000} />
      {' '}
      <FormattedTime value={createdAt * 1000} />
    </td>
    {createActions &&
      <td className="text-right">
        {createActions(id)}
      </td>}
  </tr>;

ExercisesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  groupId: PropTypes.string,
  name: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(ExercisesListItem);
