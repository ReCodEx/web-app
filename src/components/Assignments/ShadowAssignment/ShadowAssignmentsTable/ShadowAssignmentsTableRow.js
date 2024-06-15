import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { lruMemoize } from 'reselect';

import withLinks from '../../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import { EditIcon, MaybeBonusAssignmentIcon, VisibleIcon, WarningIcon } from '../../../icons';
import DeleteShadowAssignmentButtonContainer from '../../../../containers/DeleteShadowAssignmentButtonContainer';
import Button, { TheButtonGroup } from '../../../widgets/TheButton';
import DateTime from '../../../widgets/DateTime';
import { safeGet } from '../../../../helpers/common';

const getUserPoints = lruMemoize((points, userId) =>
  safeGet(points, [({ awardeeId }) => awardeeId === userId, 'points'], <span>&mdash;</span>)
);

const getUserPointsNote = lruMemoize((points, userId) =>
  safeGet(points, [({ awardeeId }) => awardeeId === userId, 'note'], '')
);

const ShadowAssignmentsTableRow = ({
  item: { id, localizedTexts, createdAt, deadline, isBonus, isPublic, maxPoints, points, permissionHints },
  userId,
  isAdmin,
  doubleClickPush,
  links: { SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY, SHADOW_ASSIGNMENT_EDIT_URI_FACTORY },
}) => (
  <tr onDoubleClick={doubleClickPush && (() => doubleClickPush(SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY(id)))}>
    <td className="text-nowrap shrink-col">
      {permissionHints.update && <VisibleIcon visible={isPublic} gapLeft gapRight />}
      <MaybeBonusAssignmentIcon id={id} isBonus={isBonus} gapLeft gapRight />
    </td>

    <td>
      <Link to={SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY(id)}>
        <LocalizedExerciseName
          entity={{ localizedTexts }}
          noNameMessage={
            <i>
              <WarningIcon className="text-warning" gapRight />
              <FormattedMessage id="app.shadowAssignment.noName" defaultMessage="no name" />
            </i>
          }
        />
      </Link>
    </td>

    <td className="text-nowrap">
      <DateTime unixts={createdAt} />
    </td>

    <td className="text-nowrap">
      <DateTime unixts={deadline} isDeadline />
    </td>

    <td className="text-center">
      {!isAdmin && getUserPoints(points, userId)}
      {maxPoints > 0 ? (
        <span>
          {!isAdmin && <span>/</span>}
          <FormattedNumber value={maxPoints} />
        </span>
      ) : (
        isAdmin && <span>&mdash;</span>
      )}
    </td>

    {!isAdmin && <td>{getUserPointsNote(points, userId)}</td>}

    <td className="text-right shrink-col text-nowrap">
      <TheButtonGroup>
        {permissionHints.update && (
          <Link to={SHADOW_ASSIGNMENT_EDIT_URI_FACTORY(id)}>
            <Button size="xs" variant="warning">
              <EditIcon gapRight />
              <FormattedMessage id="generic.edit" defaultMessage="Edit" />
            </Button>
          </Link>
        )}

        {permissionHints.remove && <DeleteShadowAssignmentButtonContainer id={id} size="xs" />}
      </TheButtonGroup>
    </td>
  </tr>
);

ShadowAssignmentsTableRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    localizedTexts: PropTypes.array,
    createdAt: PropTypes.number,
    deadline: PropTypes.number,
    isBonus: PropTypes.bool,
    isPublic: PropTypes.bool,
    maxPoints: PropTypes.number,
    points: PropTypes.array,
    permissionHints: PropTypes.object,
  }).isRequired,
  userId: PropTypes.string,
  links: PropTypes.object,
  isAdmin: PropTypes.bool,
  doubleClickPush: PropTypes.func,
};

export default withLinks(ShadowAssignmentsTableRow);
