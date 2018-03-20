import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../AssignmentStatusIcon/AssignmentStatusIcon';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import withLinks from '../../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import {
  EditIcon,
  MaybeBonusAssignmentIcon,
  MaybePublicIcon
} from '../../../icons';
import DeleteAssignmentButtonContainer from '../../../../containers/DeleteAssignmentButtonContainer';
import Button from '../../../widgets/FlatButton';

const AssignmentTableRow = ({
  showGroup,
  item: {
    id,
    name,
    group,
    localizedTexts,
    allowSecondDeadline,
    firstDeadline,
    secondDeadline,
    isBonus,
    isPublic,
    accepted
  },
  status,
  userId,
  stats,
  isAdmin,
  links: {
    ASSIGNMENT_DETAIL_URI_FACTORY,
    ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY,
    ASSIGNMENT_EDIT_URI_FACTORY
  }
}) =>
  <tr>
    <td className="text-center">
      {isAdmin
        ? <MaybePublicIcon id={id} isPublic={isPublic} />
        : <AssignmentStatusIcon id={id} status={status} accepted={accepted} />}
    </td>
    <td>
      <MaybeBonusAssignmentIcon id={id} isBonus={isBonus} />
      <Link
        to={
          userId
            ? ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY(id, userId)
            : ASSIGNMENT_DETAIL_URI_FACTORY(id)
        }
      >
        <LocalizedExerciseName entity={{ name, localizedTexts }} />
      </Link>
    </td>
    {showGroup &&
      <td>
        {group}
      </td>}
    {!isAdmin &&
      stats &&
      <td>
        {stats.points && stats.points.gained !== null
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
          : <span />}
      </td>}
    <td>
      <FormattedDate value={new Date(firstDeadline * 1000)} />
      {', '}
      <FormattedTime value={new Date(firstDeadline * 1000)} />
    </td>
    <td>
      {allowSecondDeadline
        ? <span>
            <FormattedDate value={new Date(secondDeadline * 1000)} />
            {', '}
            <FormattedTime value={new Date(secondDeadline * 1000)} />
          </span>
        : <span>-</span>}
    </td>
    {isAdmin &&
      <td className="text-right">
        <ButtonGroup>
          <LinkContainer to={ASSIGNMENT_EDIT_URI_FACTORY(id)}>
            <Button bsSize="xs" bsStyle="warning">
              <EditIcon />{' '}
              <FormattedMessage id="generic.edit" defaultMessage="Edit" />
            </Button>
          </LinkContainer>
          <DeleteAssignmentButtonContainer id={id} bsSize="xs" />
        </ButtonGroup>
      </td>}
  </tr>;

AssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool,
  item: PropTypes.shape({
    id: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    localizedTexts: PropTypes.array.isRequired,
    firstDeadline: PropTypes.number.isRequired,
    secondDeadline: PropTypes.number.isRequired,
    groupId: PropTypes.string
  }),
  status: PropTypes.string,
  userId: PropTypes.string,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(AssignmentTableRow);
