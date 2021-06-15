import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Box from '../../widgets/Box';
import Markdown from '../../widgets/Markdown';
import DateTime from '../../widgets/DateTime';
import DifficultyIcon from '../DifficultyIcon';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import withLinks from '../../../helpers/withLinks';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import Icon, { SuccessOrFailureIcon, UserIcon, VisibleIcon, CodeIcon, TagIcon } from '../../icons';
import { getLocalizedDescription } from '../../../helpers/localizedData';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import EnvironmentsList from '../../helpers/EnvironmentsList';
import Version from '../../widgets/Version/Version';
import { getTagStyle } from '../../../helpers/exercise/tags';

const ExerciseDetail = ({
  authorId,
  description = '',
  difficulty,
  createdAt,
  updatedAt,
  version,
  forkedFrom = null,
  localizedTexts,
  runtimeEnvironments,
  tags,
  isPublic,
  isLocked,
  solutionFilesLimit,
  solutionSizeLimit,
  locale,
  links: { EXERCISE_URI_FACTORY },
}) => (
  <Box title={<FormattedMessage id="generic.details" defaultMessage="Details" />} noPadding>
    <Table responsive size="sm">
      <tbody>
        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <UserIcon />
          </td>
          <th>
            <FormattedMessage id="generic.author" defaultMessage="Author" />:
          </th>
          <td>
            <UsersNameContainer userId={authorId} showEmail="icon" />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'file-alt']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.exercise.description" defaultMessage="Short description" />
            :
            <br />
            <span className="text-muted small">
              <FormattedMessage
                id="app.exercise.description.visibleOnlyToSupervisors"
                defaultMessage="(visible only to supervisors)"
              />
            </span>
          </th>
          <td>
            <Markdown source={getLocalizedDescription({ description, localizedTexts }, locale)} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="graduation-cap" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.exercise.difficulty" defaultMessage="Difficulty" />:
          </th>
          <td>
            <DifficultyIcon difficulty={difficulty} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <CodeIcon />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.exercise.runtimes" defaultMessage="Runtime environments" />:
          </th>
          <td>
            <EnvironmentsList runtimeEnvironments={runtimeEnvironments} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <TagIcon />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="generic.tags" defaultMessage="Tags" />:
          </th>
          <td>
            {tags.sort().map(tag => (
              <Badge key={tag} className="tag-margin" style={getTagStyle(tag)}>
                {tag}
              </Badge>
            ))}
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'clock']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />:
          </th>
          <td>
            <DateTime unixts={createdAt} showRelative />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'copy']} />
          </td>
          <th>
            <FormattedMessage id="generic.version" defaultMessage="Version" />:
          </th>
          <td>
            <Version version={version} createdAt={createdAt} updatedAt={updatedAt} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <VisibleIcon />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.exercise.isPublic" defaultMessage="Is public" />:
          </th>
          <td>
            <SuccessOrFailureIcon success={isPublic} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="unlock-alt" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.exercise.isLocked" defaultMessage="Is locked" />:
          </th>
          <td>
            <SuccessOrFailureIcon success={isLocked} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'folder-open']} />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.solutionFilesLimit"
              defaultMessage="Maximal number of files in a solution"
            />
            :
          </th>
          <td>{solutionFilesLimit === null ? '-' : solutionFilesLimit}</td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="weight" />
          </td>
          <th>
            <FormattedMessage
              id="app.assignment.solutionSizeLimit"
              defaultMessage="Maximal total size of submitted solution"
            />
            :
          </th>
          <td>{solutionSizeLimit === null ? '-' : `${Math.ceil(solutionSizeLimit / 1024)} KiB`}</td>
        </tr>

        {forkedFrom && (
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <Icon icon="code-branch" />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.exercise.forked" defaultMessage="Forked from" />:
            </th>
            <td>
              <ResourceRenderer resource={forkedFrom}>
                {({ id, name, localizedTexts, version }) => (
                  <span>
                    <Link to={EXERCISE_URI_FACTORY(id)}>
                      <LocalizedExerciseName entity={{ name, localizedTexts }} />
                    </Link>
                    &nbsp;&nbsp;(v
                    <FormattedNumber value={version} />)
                  </span>
                )}
              </ResourceRenderer>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </Box>
);

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
  tags: PropTypes.array.isRequired,
  isPublic: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  solutionFilesLimit: PropTypes.number,
  solutionSizeLimit: PropTypes.number,
  locale: PropTypes.string.isRequired,
  links: PropTypes.object,
};

export default withLinks(ExerciseDetail);
