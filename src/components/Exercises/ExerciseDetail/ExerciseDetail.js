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
import withLinks from '../../../helpers/withLinks.js';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import Icon, {
  AdminIcon,
  AuthorIcon,
  CodeIcon,
  ForkIcon,
  GroupIcon,
  SuccessOrFailureIcon,
  TagIcon,
  VisibleIcon,
} from '../../icons';
import { getLocalizedDescription, replaceLinkKeysWithUrls } from '../../../helpers/localizedData.js';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import EnvironmentsList from '../../helpers/EnvironmentsList';
import Version from '../../widgets/Version/Version.js';
import Explanation from '../../widgets/Explanation';
import { getTagStyle } from '../../../helpers/exercise/tags.js';

const ExerciseDetail = ({
  authorId,
  adminsIds = [],
  groupsIds = [],
  difficulty,
  createdAt,
  updatedAt,
  version,
  forkedFrom = null,
  localizedTexts,
  localizedTextsLinks,
  runtimeEnvironments,
  tags,
  isPublic,
  isLocked,
  solutionFilesLimit,
  solutionSizeLimit,
  className = '',
  locale,
  links: { EXERCISE_URI_FACTORY },
}) => (
  <Box title={<FormattedMessage id="generic.details" defaultMessage="Details" />} noPadding className={className}>
    <Table responsive size="sm" className="card-table">
      <tbody>
        <tr>
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
            <AuthorIcon />
          </td>
          <th>
            <FormattedMessage id="generic.author" defaultMessage="Author" />:
          </th>
          <td>
            <UsersNameContainer userId={authorId} showEmail="icon" link />
          </td>
        </tr>

        {adminsIds.length > 0 && (
          <tr>
            <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
              <AdminIcon />
            </td>
            <th>
              <FormattedMessage id="app.exercise.admins" defaultMessage="Administrators" />:
              <Explanation id="admins">
                <FormattedMessage
                  id="app.exercise.admins.explanation"
                  defaultMessage="The administrators have the same permissions as the author towards the exercise, but they are not explicitly mentioned in listings or used in search filters."
                />
              </Explanation>
            </th>
            <td>
              {adminsIds.map(id => (
                <div key={id}>
                  <UsersNameContainer userId={id} showEmail="icon" link />
                </div>
              ))}
            </td>
          </tr>
        )}

        <tr>
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
            <Icon icon={['far', 'file-alt']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.exercise.description" defaultMessage="Short description" />
            :
            <br />
            <span className="text-body-secondary small">
              <FormattedMessage
                id="app.exercise.description.visibleOnlyToSupervisors"
                defaultMessage="(visible only to supervisors)"
              />
            </span>
          </th>
          <td>
            <Markdown
              source={replaceLinkKeysWithUrls(getLocalizedDescription({ localizedTexts }, locale), localizedTextsLinks)}
            />
          </td>
        </tr>

        <tr>
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
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
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
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
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
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
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
            <Icon icon={['far', 'clock']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />:
          </th>
          <td>
            <DateTime unixTs={createdAt} showRelative />
          </td>
        </tr>

        <tr>
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
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
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
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
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
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
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
            <Icon icon={['far', 'folder-open']} />
          </td>
          <th>
            <FormattedMessage id="app.assignment.solutionFilesLimit" defaultMessage="Solution file restrictions" />:
            <Explanation id="solutionFilesLimit">
              <FormattedMessage
                id="app.assignment.solutionFilesLimitExplanation"
                defaultMessage="The restrictions may limit maximal number of submitted files and their total size."
              />
            </Explanation>
          </th>
          <td>
            {solutionFilesLimit !== null && (
              <FormattedMessage
                id="app.assignment.solutionFilesLimitCount"
                defaultMessage="{count} {count, plural, one {file} other {files}}"
                values={{ count: solutionFilesLimit }}
              />
            )}
            {solutionFilesLimit !== null && solutionSizeLimit !== null && ', '}
            {solutionSizeLimit !== null && (
              <FormattedMessage
                id="app.assignment.solutionFilesLimitSize"
                defaultMessage="{size} KiB {count, plural, one {} other {total}}"
                values={{ size: Math.ceil(solutionSizeLimit / 1024), count: solutionFilesLimit || 0 }}
              />
            )}
            {solutionFilesLimit === null && solutionSizeLimit === null && '-'}
          </td>
        </tr>

        {forkedFrom && (
          <tr>
            <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
              <ForkIcon />
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

        <tr>
          <td className="text-center text-body-secondary shrink-col ps-3 pe-3">
            <GroupIcon />
          </td>
          <td className="text-nowrap" colSpan={2}>
            <strong>
              <FormattedMessage id="app.exercise.groups" defaultMessage="Groups of Residence" />:
            </strong>
            {groupsIds.map(groupId => (
              <div key={groupId} className="mt-1">
                <GroupsNameContainer groupId={groupId} fullName translations links admins />
              </div>
            ))}
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

ExerciseDetail.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  adminsIds: PropTypes.array,
  groupsIds: PropTypes.array,
  difficulty: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired,
  forkedFrom: PropTypes.object,
  localizedTexts: PropTypes.array.isRequired,
  localizedTextsLinks: PropTypes.object,
  runtimeEnvironments: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  isPublic: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  solutionFilesLimit: PropTypes.number,
  solutionSizeLimit: PropTypes.number,
  className: PropTypes.string,
  locale: PropTypes.string.isRequired,
  links: PropTypes.object,
};

export default withLinks(ExerciseDetail);
