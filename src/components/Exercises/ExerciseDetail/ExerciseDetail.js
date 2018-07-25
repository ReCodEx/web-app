import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedNumber,
  FormattedTime,
  FormattedDate,
  FormattedRelative
} from 'react-intl';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';

import Box from '../../widgets/Box';
import Markdown from '../../widgets/Markdown';
import DifficultyIcon from '../DifficultyIcon';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import withLinks from '../../../helpers/withLinks';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { SuccessOrFailureIcon } from '../../icons';
import { getLocalizedDescription } from '../../../helpers/getLocalizedData';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import EnvironmentsList from '../../helpers/EnvironmentsList';

const ExerciseDetail = ({
  id,
  name,
  authorId,
  groupsIds = [],
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
  locale,
  links: { EXERCISE_URI_FACTORY }
}) =>
  <Box
    title={<LocalizedExerciseName entity={{ name, localizedTexts }} />}
    noPadding
  >
    <Table>
      <tbody>
        <tr>
          <th>
            <FormattedMessage id="generic.author" defaultMessage="Author" />:
          </th>
          <td>
            <UsersNameContainer userId={authorId} />
          </td>
        </tr>

        <tr>
          <th className="text-nowrap">
            <FormattedMessage
              id="app.exercise.description"
              defaultMessage="Short description"
            />:
            <br />
            <span className="text-muted small">
              <FormattedMessage
                id="app.exercise.description.visibleOnlyToSupervisors"
                defaultMessage="(visible only to supervisors)"
              />
            </span>
          </th>
          <td>
            <Markdown
              source={getLocalizedDescription(
                { description, localizedTexts },
                locale
              )}
            />
          </td>
        </tr>

        <tr>
          <th className="text-nowrap">
            <FormattedMessage
              id="app.exercise.difficulty"
              defaultMessage="Difficulty"
            />:
          </th>
          <td>
            <DifficultyIcon difficulty={difficulty} />
          </td>
        </tr>

        <tr>
          <th className="text-nowrap">
            <FormattedMessage
              id="app.exercise.runtimes"
              defaultMessage="Runtime environments"
            />:
          </th>
          <td>
            <EnvironmentsList runtimeEnvironments={runtimeEnvironments} />
          </td>
        </tr>

        <tr>
          <th className="text-nowrap">
            <FormattedMessage
              id="app.exercise.createdAt"
              defaultMessage="Created at"
            />:
          </th>
          <td>
            <FormattedDate value={createdAt * 1000} />{' '}
            <FormattedTime value={createdAt * 1000} />{' '}
            <span className="text-muted small">
              (<FormattedRelative value={createdAt * 1000} />)
            </span>
          </td>
        </tr>

        {updatedAt !== createdAt &&
          <tr>
            <th className="text-nowrap">
              <FormattedMessage
                id="app.exercise.updatedAt"
                defaultMessage="Last updated at"
              />:
            </th>
            <td>
              <FormattedDate value={updatedAt * 1000} />{' '}
              <FormattedTime value={updatedAt * 1000} />{' '}
              <span className="text-muted small">
                (<FormattedRelative value={updatedAt * 1000} />)
              </span>
            </td>
          </tr>}

        <tr>
          <th>
            <FormattedMessage
              id="app.exercise.version"
              defaultMessage="Version"
            />:
          </th>
          <td>
            v<FormattedNumber value={version} />
          </td>
        </tr>
        <tr>
          <th className="text-nowrap">
            <FormattedMessage
              id="app.exercise.isPublic"
              defaultMessage="Is public"
            />:
          </th>
          <td>
            <SuccessOrFailureIcon success={isPublic} />
          </td>
        </tr>
        <tr>
          <th className="text-nowrap">
            <FormattedMessage
              id="app.exercise.isLocked"
              defaultMessage="Is locked"
            />:
          </th>
          <td>
            <SuccessOrFailureIcon success={isLocked} />
          </td>
        </tr>

        {forkedFrom &&
          <tr>
            <th className="text-nowrap">
              <FormattedMessage
                id="app.exercise.forked"
                defaultMessage="Forked from"
              />:
            </th>
            <td>
              <ResourceRenderer resource={forkedFrom}>
                {({ id, name, localizedTexts, version }) =>
                  <span>
                    <Link to={EXERCISE_URI_FACTORY(id)}>
                      <LocalizedExerciseName
                        entity={{ name, localizedTexts }}
                      />
                    </Link>
                    &nbsp;&nbsp;(v<FormattedNumber value={version} />)
                  </span>}
              </ResourceRenderer>
            </td>
          </tr>}
      </tbody>
    </Table>
  </Box>;

ExerciseDetail.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  groupsIds: PropTypes.array,
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
  locale: PropTypes.string.isRequired,
  links: PropTypes.object
};

export default withLinks(ExerciseDetail);
