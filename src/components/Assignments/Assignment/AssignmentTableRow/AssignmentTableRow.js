import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import AssignmentStatusIcon from '../AssignmentStatusIcon/AssignmentStatusIcon';
import { FormattedDate, FormattedTime } from 'react-intl';

const AssignmentTableRow = ({
  showGroup,
  item: { id, name, deadline, group }
}, {
  links: { ASSIGNMENT_DETAIL_URI_FACTORY }
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

AssignmentTableRow.contextTypes = {
  links: PropTypes.object
};

export default AssignmentTableRow;
