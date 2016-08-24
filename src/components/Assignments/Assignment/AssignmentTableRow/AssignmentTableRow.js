import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import AssignmentStatusIcon from '../AssignmentStatusIcon/AssignmentStatusIcon';
import { FormattedDate, FormattedTime } from 'react-intl';
import { ASSIGNMENT_DETAIL_URI_FACTORY } from '../../../../links';

const AssignmentTableRow = ({
  showGroup,
  item: { id, name, deadline, group }
}) => (
  <tr>
    <td className='text-center'>
      <AssignmentStatusIcon status={'unknown'} />
    </td>
    <td>
      <Link to={ASSIGNMENT_DETAIL_URI_FACTORY(id)}>{name}</Link>
    </td>
    {showGroup &&
      <td>{group}</td>}
    <td>
      <FormattedDate value={new Date(deadline.first * 1000)} />{', '}
      <FormattedTime value={new Date(deadline.first * 1000)} />
    </td>
    <td>
      <FormattedDate value={new Date(deadline.second * 1000)} />{', '}
      <FormattedTime value={new Date(deadline.second * 1000)} />
    </td>
  </tr>
);

AssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool,
  item: PropTypes.shape({
    id: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    deadline: PropTypes.shape({
      first: PropTypes.number.isRequired,
      second: PropTypes.number.isRequired
    }),
    groupId: PropTypes.string
  })
};

export default AssignmentTableRow;
