import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import DifficultyIcon from '../DifficultyIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import { Link } from 'react-router';

import withLinks from '../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import EnvironmentsList from '../../helpers/EnvironmentsList';
import { ExercisePrefixIcons } from '../../icons';

const ExercisesListItem = ({
  id,
  name,
  difficulty,
  authorId,
  runtimeEnvironments,
  groupsIds = [],
  localizedTexts,
  createdAt,
  isLocked,
  isBroken,
  createActions,
  locale,
  links: { EXERCISE_URI_FACTORY }
}) =>
  <tr>
    <td className="text-center">
      <FontAwesomeIcon icon="code" />
    </td>
    <td>
      <ExercisePrefixIcons id={id} isLocked={isLocked} isBroken={isBroken} />
      <strong>
        <Link to={EXERCISE_URI_FACTORY(id)}>
          <LocalizedExerciseName entity={{ name, localizedTexts }} />
        </Link>
      </strong>
    </td>
    <td>
      <UsersNameContainer userId={authorId} />
    </td>
    <td>
      {runtimeEnvironments &&
        <EnvironmentsList runtimeEnvironments={runtimeEnvironments} />}
    </td>
    <td>
      {groupsIds.length > 0
        ? groupsIds.map((groupId, i) =>
            <div key={i}>
              <GroupsNameContainer groupId={groupId} />
            </div>
          )
        : <i className="text-muted">
            <FormattedMessage
              id="app.exercisesListItem.noGroups"
              defaultMessage="no groups"
            />
          </i>}
    </td>
    <td className="text-nowrap">
      <DifficultyIcon difficulty={difficulty} />
    </td>
    <td className="text-nowrap">
      <FormattedDate value={createdAt * 1000} />{' '}
      <FormattedTime value={createdAt * 1000} />
    </td>
    {createActions &&
      <td className="text-right text-nowrap">
        {createActions(id)}
      </td>}
  </tr>;

ExercisesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  groupsIds: PropTypes.array,
  name: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isBroken: PropTypes.bool.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  createActions: PropTypes.func,
  locale: PropTypes.string.isRequired,
  links: PropTypes.object
};

export default withLinks(ExercisesListItem);
