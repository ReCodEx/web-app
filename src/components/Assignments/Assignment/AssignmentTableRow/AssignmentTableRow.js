import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../AssignmentStatusIcon/AssignmentStatusIcon';
import { FormattedDate, FormattedTime } from 'react-intl';

import withLinks from '../../../../hoc/withLinks';
import { MaybeBonusAssignmentIcon } from '../../../icons';

const AssignmentTableRow = ({
  showGroup,
  item: {
    id,
    name,
    group,
    allowSecondDeadline,
    firstDeadline,
    secondDeadline,
    isBonus,
    accepted
  },
  status,
  userId,
  links: {
    ASSIGNMENT_DETAIL_URI_FACTORY,
    ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY
  }
}) =>
  <tr>
    <td className="text-center">
      <AssignmentStatusIcon id={id} status={status} accepted={accepted} />
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
        {name}
      </Link>
    </td>
    {showGroup && <td>{group}</td>}
    <td>
      <FormattedDate value={new Date(firstDeadline * 1000)} />{', '}
      <FormattedTime value={new Date(firstDeadline * 1000)} />
    </td>
    <td>
      {allowSecondDeadline
        ? <span>
            <FormattedDate value={new Date(secondDeadline * 1000)} />{', '}
            <FormattedTime value={new Date(secondDeadline * 1000)} />
          </span>
        : <span>-</span>}
    </td>
  </tr>;

AssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool,
  item: PropTypes.shape({
    id: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    firstDeadline: PropTypes.number.isRequired,
    secondDeadline: PropTypes.number.isRequired,
    groupId: PropTypes.string
  }),
  status: PropTypes.string,
  userId: PropTypes.string,
  links: PropTypes.object
};

export default withLinks(AssignmentTableRow);
