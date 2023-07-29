import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import AssignmentSyncIcon from '../AssignmentSyncIcon';
import AssignmentStatusIcon from '../AssignmentStatusIcon';
import AssignmentMaxPoints from '../AssignmentMaxPoints';
import withLinks from '../../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import { ChatIcon, EditIcon, ResultsIcon, MaybeBonusAssignmentIcon, MaybeVisibleAssignmentIcon } from '../../../icons';
import DeleteAssignmentButtonContainer from '../../../../containers/DeleteAssignmentButtonContainer';
import Button, { TheButtonGroup } from '../../../widgets/TheButton';
import DateTime from '../../../widgets/DateTime';
import NiceCheckbox from '../../../forms/NiceCheckbox';
import EnvironmentsList from '../../../helpers/EnvironmentsList';
import ResourceRenderer from '../../../helpers/ResourceRenderer';
import { getGroupCanonicalLocalizedName } from '../../../../helpers/localizedData';

const AssignmentTableRow = ({
  item: {
    id,
    groupId,
    localizedTexts,
    allowSecondDeadline,
    firstDeadline,
    maxPointsBeforeFirstDeadline,
    secondDeadline,
    maxPointsBeforeSecondDeadline,
    maxPointsDeadlineInterpolation,
    isBonus,
    isPublic,
    visibleFrom,
    accepted,
    permissionHints,
    exerciseSynchronizationInfo,
  },
  runtimeEnvironments = null,
  status,
  userId,
  stats,
  isAdmin,
  showNames = true,
  showGroups = false,
  showSecondDeadline = true,
  groupsAccessor = null,
  discussionOpen,
  setSelected = null,
  selected = false,
  doubleClickPush = null,
  intl: { locale },
  links: {
    ASSIGNMENT_DETAIL_URI_FACTORY,
    ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY,
    ASSIGNMENT_EDIT_URI_FACTORY,
    ASSIGNMENT_STATS_URI_FACTORY,
    GROUP_ASSIGNMENTS_URI_FACTORY,
  },
}) => (
  <tr
    onDoubleClick={
      doubleClickPush &&
      !setSelected &&
      (() =>
        doubleClickPush(
          userId ? ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY(id, userId) : ASSIGNMENT_DETAIL_URI_FACTORY(id)
        ))
    }>
    {setSelected && (
      <td className="text-nowrap shrink-col">
        <NiceCheckbox name={id} checked={selected} onChange={setSelected} />
      </td>
    )}

    <td className="text-nowrap shrink-col">
      {permissionHints.update || permissionHints.viewAssignmentSolutions ? (
        <MaybeVisibleAssignmentIcon id={id} isPublic={isPublic} visibleFrom={visibleFrom} />
      ) : (
        <AssignmentStatusIcon id={id} status={status} accepted={accepted} />
      )}
      <MaybeBonusAssignmentIcon gapLeft id={id} isBonus={isBonus} />

      {(permissionHints.update || permissionHints.viewAssignmentSolutions) && exerciseSynchronizationInfo && (
        <AssignmentSyncIcon id={id} syncInfo={exerciseSynchronizationInfo} gapLeft />
      )}
    </td>

    {showNames && (
      <td>
        <Link to={userId ? ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY(id, userId) : ASSIGNMENT_DETAIL_URI_FACTORY(id)}>
          <LocalizedExerciseName entity={{ name: '??', localizedTexts }} />
        </Link>
      </td>
    )}

    {showGroups && groupsAccessor && (
      <td>
        <Link to={GROUP_ASSIGNMENTS_URI_FACTORY(groupId)}>
          {getGroupCanonicalLocalizedName(groupId, groupsAccessor, locale)}
        </Link>
      </td>
    )}

    {runtimeEnvironments && (
      <td>
        <ResourceRenderer resource={runtimeEnvironments} returnAsArray>
          {runtimes => <EnvironmentsList runtimeEnvironments={runtimes} />}
        </ResourceRenderer>
      </td>
    )}

    {!isAdmin && stats && (
      <td className="text-center text-nowrap">
        {stats.points && stats.points.gained !== null ? (
          <span>
            {stats.points.gained}
            {stats.points.bonus > 0 && <span style={{ color: 'green' }}>+{stats.points.bonus}</span>}
            {stats.points.bonus < 0 && <span style={{ color: 'red' }}>{stats.points.bonus}</span>}
          </span>
        ) : null}
      </td>
    )}
    <td className="text-nowrap">
      <DateTime unixts={firstDeadline} isDeadline />
    </td>

    {showSecondDeadline && (
      <td className="text-nowrap">
        <DateTime unixts={allowSecondDeadline ? secondDeadline : null} isDeadline />
      </td>
    )}

    <td className="text-center text-nowrap shrink-col">
      <AssignmentMaxPoints
        allowSecondDeadline={allowSecondDeadline}
        maxPointsDeadlineInterpolation={maxPointsDeadlineInterpolation}
        maxPointsBeforeFirstDeadline={maxPointsBeforeFirstDeadline}
        maxPointsBeforeSecondDeadline={maxPointsBeforeSecondDeadline}
      />
    </td>

    <td className="text-right text-nowrap valign-middle">
      <TheButtonGroup>
        {discussionOpen &&
          (permissionHints.viewAssignmentSolutions || permissionHints.update || permissionHints.remove ? (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`discussion-${id}`}>
                  <FormattedMessage id="generic.discussion" defaultMessage="Discussion" />
                </Tooltip>
              }>
              <Button size="xs" variant="info" onClick={discussionOpen}>
                <ChatIcon smallGapLeft smallGapRight />
              </Button>
            </OverlayTrigger>
          ) : (
            <Button size="xs" variant="info" onClick={discussionOpen}>
              <ChatIcon gapRight />
              <FormattedMessage id="generic.discussion" defaultMessage="Discussion" />
            </Button>
          ))}

        {permissionHints.viewAssignmentSolutions && (
          <Link to={ASSIGNMENT_STATS_URI_FACTORY(id)}>
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`results-${id}`}>
                  <FormattedMessage id="generic.results" defaultMessage="Results" />
                </Tooltip>
              }>
              <Button size="xs" variant="primary">
                <ResultsIcon smallGapLeft smallGapRight />
              </Button>
            </OverlayTrigger>
          </Link>
        )}

        {permissionHints.update && (
          <Link to={ASSIGNMENT_EDIT_URI_FACTORY(id)}>
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`edit-${id}`}>
                  <FormattedMessage id="generic.edit" defaultMessage="Edit" />
                </Tooltip>
              }>
              <Button size="xs" variant="warning">
                <EditIcon smallGapLeft smallGapRight />
              </Button>
            </OverlayTrigger>
          </Link>
        )}

        {permissionHints.remove && <DeleteAssignmentButtonContainer id={id} size="xs" captionAsTooltip />}
      </TheButtonGroup>
    </td>
  </tr>
);

AssignmentTableRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired,
    localizedTexts: PropTypes.array,
    allowSecondDeadline: PropTypes.bool,
    firstDeadline: PropTypes.number,
    maxPointsBeforeFirstDeadline: PropTypes.number,
    secondDeadline: PropTypes.number,
    maxPointsBeforeSecondDeadline: PropTypes.number,
    maxPointsDeadlineInterpolation: PropTypes.bool,
    isBonus: PropTypes.bool,
    isPublic: PropTypes.bool,
    visibleFrom: PropTypes.number,
    accepted: PropTypes.bool,
    permissionHints: PropTypes.object,
    exerciseSynchronizationInfo: PropTypes.object,
  }).isRequired,
  runtimeEnvironments: PropTypes.array,
  status: PropTypes.string,
  userId: PropTypes.string,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  showNames: PropTypes.bool,
  showGroups: PropTypes.bool,
  showSecondDeadline: PropTypes.bool,
  setSelected: PropTypes.func,
  selected: PropTypes.bool,
  doubleClickPush: PropTypes.func,
  groupsAccessor: PropTypes.func,
  discussionOpen: PropTypes.func,
  links: PropTypes.object,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(withLinks(AssignmentTableRow));
