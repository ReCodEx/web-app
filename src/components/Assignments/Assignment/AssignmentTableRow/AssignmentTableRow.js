import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../AssignmentStatusIcon/AssignmentStatusIcon';
import { FormattedDate, FormattedTime } from 'react-intl';

const AssignmentTableRow = ({
  showGroup,
  item: {
    id,
    name,
    group,
    allowSecondDeadline,
    firstDeadline,
    secondDeadline
  },
  status
}, {
  links: { ASSIGNMENT_DETAIL_URI_FACTORY }
}) => (
  <tr>
    <td className='text-center'>
      {status && <AssignmentStatusIcon status={status} />}
    </td>
    <td>
      <Link to={ASSIGNMENT_DETAIL_URI_FACTORY(id)}>{name}</Link>
    </td>
    {showGroup && <td>{group}</td>}
    <td>
      <FormattedDate value={new Date(firstDeadline * 1000)} />{', '}
      <FormattedTime value={new Date(firstDeadline * 1000)} />
    </td>
    <td>
      {allowSecondDeadline
        ? (
          <span>
            <FormattedDate value={new Date(secondDeadline * 1000)} />{', '}
            <FormattedTime value={new Date(secondDeadline * 1000)} />
          </span>
        ) : <span>-</span>}
    </td>
  </tr>
);

AssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool,
  item: PropTypes.shape({
    id: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    firstDeadline: PropTypes.number.isRequired,
    secondDeadline: PropTypes.number.isRequired,
    groupId: PropTypes.string
  }),
  status: PropTypes.string
};

AssignmentTableRow.contextTypes = {
  links: PropTypes.object
};

export default AssignmentTableRow;
