import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';
import { defaultMemoize } from 'reselect';

import withLinks from '../../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import { EditIcon, MaybeBonusAssignmentIcon, VisibleIcon, WarningIcon } from '../../../icons';
import DeleteShadowAssignmentButtonContainer from '../../../../containers/DeleteShadowAssignmentButtonContainer';
import Button from '../../../widgets/FlatButton';
import DateTime from '../../../widgets/DateTime';
import { safeGet } from '../../../../helpers/common';

const getUserPoints = defaultMemoize((points, userId) =>
  safeGet(points, [({ awardeeId }) => awardeeId === userId, 'points'], <span>&mdash;</span>)
);

const getUserPointsNote = defaultMemoize((points, userId) =>
  safeGet(points, [({ awardeeId }) => awardeeId === userId, 'note'], '')
);

const ShadowAssignmentsTableRow = ({
  item: { id, localizedTexts, createdAt, isBonus, isPublic, maxPoints, points, permissionHints },
  userId,
  isAdmin,
  links: { SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY, SHADOW_ASSIGNMENT_EDIT_URI_FACTORY },
}) => (
  <tr>
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
      {permissionHints.update && (
        <LinkContainer to={SHADOW_ASSIGNMENT_EDIT_URI_FACTORY(id)}>
          <Button bsSize="xs" variant="warning">
            <EditIcon gapRight />
            <FormattedMessage id="generic.edit" defaultMessage="Edit" />
          </Button>
        </LinkContainer>
      )}

      {permissionHints.remove && <DeleteShadowAssignmentButtonContainer id={id} bsSize="xs" />}
    </td>
  </tr>
);

ShadowAssignmentsTableRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    localizedTexts: PropTypes.array,
    createdAt: PropTypes.number,
    isBonus: PropTypes.bool,
    isPublic: PropTypes.bool,
    maxPoints: PropTypes.number,
    points: PropTypes.array,
    permissionHints: PropTypes.object,
  }).isRequired,
  userId: PropTypes.string,
  links: PropTypes.object,
  isAdmin: PropTypes.bool,
};

export default withLinks(ShadowAssignmentsTableRow);
