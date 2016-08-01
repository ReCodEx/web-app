import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import AssignmentStatusIcon from '../AssignmentStatusIcon/AssignmentStatusIcon';
import { FormattedDate } from 'react-intl';
import { ASSIGNMENT_DETAIL_URI_FACTORY } from '../../links';

const AssignmentTableRow = ({
  showGroup,
  item: { id, name, deadline, group /*, passingTests, totalTests, percent */ }
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
      <FormattedDate value={new Date(deadline.first * 1000)} />
    </td>
    <td>
      <FormattedDate value={new Date(deadline.second * 1000)} />{', '}
      <FormattedDate value={new Date(deadline.second * 1000)} />
    </td>
    {/*
    <td className='text-center'>
      {passingTests}/{totalTests}
    </td>
    <td className={classNames({
      'text-center': true,
      'text-green': percent === 100,
      'text-bold': percent === 100 })}>
      {percent}&nbsp;%
    </td>
    */}
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
    group: PropTypes.any.isRequired
  })
};

export default AssignmentTableRow;
