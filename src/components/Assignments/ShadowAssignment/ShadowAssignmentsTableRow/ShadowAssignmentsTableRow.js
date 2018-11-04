import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';

import withLinks from '../../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import {
  EditIcon,
  MaybeBonusAssignmentIcon,
  VisibleIcon,
  WarningIcon
} from '../../../icons';
import DeleteShadowAssignmentButtonContainer from '../../../../containers/DeleteShadowAssignmentButtonContainer';
import Button from '../../../widgets/FlatButton';
import DateTime from '../../../widgets/DateTime';

const ShadowAssignmentsTableRow = ({
  item: {
    id,
    localizedTexts,
    createdAt,
    isBonus,
    isPublic,
    maxPoints,
    permissionHints
  },
  // TODO userId,
  stats,
  links: {
    SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY,
    // TODO ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY,
    SHADOW_ASSIGNMENT_EDIT_URI_FACTORY
  }
}) =>
  <tr>
    <td className="text-nowrap shrink-col">
      {permissionHints.update &&
        <VisibleIcon visible={isPublic} gapLeft gapRight />}
      <MaybeBonusAssignmentIcon id={id} isBonus={isBonus} gapLeft gapRight />
    </td>
    <td>
      <Link to={SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY(id)}>
        <LocalizedExerciseName
          entity={{ localizedTexts }}
          noNameMessage={
            <i>
              <WarningIcon className="text-warning" gapRight />
              <FormattedMessage
                id="app.shadowAssignment.noName"
                defaultMessage="no name"
              />
            </i>
          }
        />
      </Link>
    </td>
    <td>
      <DateTime unixts={createdAt} />
    </td>
    {!permissionHints.update &&
      stats &&
      <td>
        {/* TODO stats.points && stats.points.gained !== null
          ? <span>
              {stats.points.gained}
              {stats.points.bonus > 0 &&
                <span style={{ color: 'green' }}>
                  +{stats.points.bonus}
                </span>}
              {stats.points.bonus < 0 &&
                <span style={{ color: 'red' }}>
                  {stats.points.bonus}
                </span>}/{stats.points.total}
            </span>
              : <span /> */}
      </td>}
    <td className="text-center">
      <FormattedNumber value={maxPoints} />
    </td>
    <td className="text-right shrink-col text-nowrap">
      {permissionHints.update &&
        <LinkContainer to={SHADOW_ASSIGNMENT_EDIT_URI_FACTORY(id)}>
          <Button bsSize="xs" bsStyle="warning">
            <EditIcon gapRight />
            <FormattedMessage id="generic.edit" defaultMessage="Edit" />
          </Button>
        </LinkContainer>}

      {permissionHints.remove &&
        <DeleteShadowAssignmentButtonContainer id={id} bsSize="xs" />}
    </td>
  </tr>;

ShadowAssignmentsTableRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    localizedTexts: PropTypes.array,
    createdAt: PropTypes.number,
    isBonus: PropTypes.bool,
    isPublic: PropTypes.bool,
    maxPoints: PropTypes.number,
    permissionHints: PropTypes.object
  }).isRequired,
  userId: PropTypes.string,
  stats: PropTypes.object,
  links: PropTypes.object
};

export default withLinks(ShadowAssignmentsTableRow);
