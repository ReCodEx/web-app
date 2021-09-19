import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';

import DifficultyIcon from '../DifficultyIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import DeleteExerciseButtonContainer from '../../../containers/DeleteExerciseButtonContainer';

import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import EnvironmentsList from '../../helpers/EnvironmentsList';
import { ExercisePrefixIcons, EditIcon, LimitsIcon, TestsIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import DateTime from '../../widgets/DateTime';
import AssignExerciseButton from '../../buttons/AssignExerciseButton';
import { getTagStyle } from '../../../helpers/exercise/tags';

import withLinks from '../../../helpers/withLinks';

const ExercisesListItem = ({
  id,
  name,
  difficulty,
  authorId,
  runtimeEnvironments,
  tags,
  groupsIds = [],
  localizedTexts,
  createdAt,
  updatedAt,
  isPublic,
  isLocked,
  isBroken,
  hasReferenceSolutions,
  permissionHints,
  showGroups = false,
  showAssignButton = false,
  assignExercise = null,
  reload,
  links: {
    EXERCISE_URI_FACTORY,
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_EDIT_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY,
  },
}) => (
  <tr>
    <td className="shrink-col">
      <ExercisePrefixIcons
        id={id}
        isPublic={isPublic}
        isLocked={isLocked}
        isBroken={isBroken}
        hasReferenceSolutions={hasReferenceSolutions}
      />
    </td>

    <td>
      <strong>
        {permissionHints.viewDetail ? (
          <Link to={EXERCISE_URI_FACTORY(id)}>
            <LocalizedExerciseName entity={{ name, localizedTexts }} />
          </Link>
        ) : (
          <LocalizedExerciseName entity={{ name, localizedTexts }} />
        )}
      </strong>
    </td>

    <td>
      <UsersNameContainer userId={authorId} link />
    </td>

    <td className="small">{runtimeEnvironments && <EnvironmentsList runtimeEnvironments={runtimeEnvironments} />}</td>

    <td className="small">
      {tags.sort().map(tag => (
        <Badge key={tag} className="tag-margin" style={getTagStyle(tag)}>
          {tag}
        </Badge>
      ))}
    </td>

    {showGroups && (
      <td className="small">
        {groupsIds.length > 0 ? (
          groupsIds.map((groupId, i) => (
            <div key={i}>
              <GroupsNameContainer groupId={groupId} translations links />
            </div>
          ))
        ) : (
          <i className="text-muted">
            <FormattedMessage id="app.exercisesListItem.noGroups" defaultMessage="no groups" />
          </i>
        )}
      </td>
    )}

    <td className="text-nowrap">
      <DifficultyIcon difficulty={difficulty} />
    </td>

    <td className="text-nowrap">
      <DateTime
        unixts={createdAt}
        showOverlay
        showTime={false}
        overlayTooltipId={`created-tooltip-${id}`}
        customTooltip={
          <span>
            <FormattedMessage id="generic.created" defaultMessage="Created" />
            : <DateTime unixts={createdAt} noWrap={false} />
            <br />
            <FormattedMessage id="generic.updated" defaultMessage="Updated" />
            : <DateTime unixts={updatedAt} noWrap={false} />
          </span>
        }
      />
    </td>

    <td className="text-right text-nowrap">
      <TheButtonGroup>
        {showAssignButton && assignExercise && (
          <AssignExerciseButton
            id={id}
            isLocked={isLocked}
            isBroken={isBroken}
            hasReferenceSolutions={hasReferenceSolutions}
            assignExercise={() => assignExercise(id)}
          />
        )}
        {permissionHints.update && (
          <Link to={EXERCISE_EDIT_URI_FACTORY(id)}>
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`${id}-settings`}>
                  <FormattedMessage id="app.exercises.listEdit" defaultMessage="Settings" />
                </Tooltip>
              }>
              <Button size="xs" variant="warning">
                <EditIcon smallGapLeft smallGapRight />
              </Button>
            </OverlayTrigger>
          </Link>
        )}
        {permissionHints.viewPipelines && permissionHints.viewScoreConfig && (
          <Link to={EXERCISE_EDIT_CONFIG_URI_FACTORY(id)}>
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`${id}-tests`}>
                  <FormattedMessage id="app.exercises.listEditConfig" defaultMessage="Tests" />
                </Tooltip>
              }>
              <Button size="xs" variant={permissionHints.setScoreConfig ? 'warning' : 'secondary'}>
                <TestsIcon smallGapLeft smallGapRight />
              </Button>
            </OverlayTrigger>
          </Link>
        )}
        {permissionHints.viewLimits && (
          <Link to={EXERCISE_EDIT_LIMITS_URI_FACTORY(id)}>
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`${id}-limits`}>
                  <FormattedMessage id="app.exercises.listEditLimits" defaultMessage="Limits" />
                </Tooltip>
              }>
              <Button size="xs" variant={permissionHints.setLimits ? 'warning' : 'secondary'}>
                <LimitsIcon smallGapLeft smallGapRight />
              </Button>
            </OverlayTrigger>
          </Link>
        )}
        {permissionHints.remove && (
          <DeleteExerciseButtonContainer id={id} size="xs" resourceless captionAsTooltip onDeleted={reload} />
        )}
      </TheButtonGroup>
    </td>
  </tr>
);

ExercisesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  groupsIds: PropTypes.array,
  name: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  isPublic: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isBroken: PropTypes.bool.isRequired,
  hasReferenceSolutions: PropTypes.bool.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  permissionHints: PropTypes.object.isRequired,
  showGroups: PropTypes.bool,
  showAssignButton: PropTypes.bool,
  assignExercise: PropTypes.func,
  reload: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(ExercisesListItem);
