import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedNumber,
  FormattedTime,
  FormattedDate
} from 'react-intl';
import { Table, Label } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router';
import Box from '../../widgets/Box';
import DifficultyIcon from '../DifficultyIcon';

import withLinks from '../../../hoc/withLinks';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import styles from './ExerciseDetail.less';
import { MaybeSucceededIcon } from '../../icons';

const ExerciseDetail = ({
  id,
  name,
  authorId,
  groupId,
  description = '',
  difficulty,
  createdAt,
  updatedAt,
  version,
  forkedFrom = null,
  localizedTexts,
  runtimeEnvironments,
  isPublic,
  isLocked,
  links: { EXERCISE_URI_FACTORY }
}) => (
  <Box title={name} noPadding>
    <Table>
      <tbody>
        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.author"
              defaultMessage="Author:"
            />
          </th>
          <td>
            <UsersNameContainer userId={authorId} />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage id="app.exercise.group" defaultMessage="Group:" />
          </th>
          <td>
            {groupId ? (
              <GroupsNameContainer groupId={groupId} />
            ) : (
              <i>
                <FormattedMessage
                  id="app.exercise.publicGroup"
                  defaultMessage="Public"
                />
              </i>
            )}
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.difficulty"
              defaultMessage="Difficulty:"
            />
          </th>
          <td>
            <DifficultyIcon difficulty={difficulty} />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.description"
              defaultMessage="Author's description:"
            />
          </th>
          <td>
            <ReactMarkdown source={description} />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.createdAt"
              defaultMessage="Created at:"
            />
          </th>
          <td>
            <FormattedDate value={createdAt * 1000} />{' '}
            <FormattedTime value={createdAt * 1000} />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.updatedAt"
              defaultMessage="Last updateded at:"
            />
          </th>
          <td>
            <FormattedDate value={updatedAt * 1000} />{' '}
            <FormattedTime value={updatedAt * 1000} />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.version"
              defaultMessage="Version:"
            />
          </th>
          <td>
            v<FormattedNumber value={version} />
          </td>
        </tr>
        {forkedFrom && (
          <tr>
            <th>
              <FormattedMessage
                id="app.exercise.forked"
                defaultMessage="Forked from:"
              />
            </th>
            <td>
              <Link to={EXERCISE_URI_FACTORY(forkedFrom.id)}>
                {forkedFrom.name} (
                <FormattedNumber value={forkedFrom.version} />
                )
              </Link>
            </td>
          </tr>
        )}
        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.runtimes"
              defaultMessage="Supported runtime environments:"
            />
          </th>
          <td>
            {runtimeEnvironments.map(({ id, name }) => (
              <Label key={id} className={styles.environment}>
                {name}
              </Label>
            ))}
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.isPublic"
              defaultMessage="Is public:"
            />
          </th>
          <td>
            <MaybeSucceededIcon success={isPublic} />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.isLocked"
              defaultMessage="Is locked:"
            />
          </th>
          <td>
            <MaybeSucceededIcon success={isLocked} />
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

ExerciseDetail.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  groupId: PropTypes.string,
  difficulty: PropTypes.string.isRequired,
  description: PropTypes.string,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired,
  forkedFrom: PropTypes.object,
  localizedTexts: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  isPublic: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  links: PropTypes.object
};

export default withLinks(ExerciseDetail);
