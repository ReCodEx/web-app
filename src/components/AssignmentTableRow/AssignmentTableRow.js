import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Icon from 'react-fontawesome';
import classNames from 'classnames';

export const getIcon = (status) => {
  switch (status) {
    case 'done':
      return <Icon name='thumbs-o-up' className='text-green' />;

    case 'work-in-progress':
      return <Icon name='cogs' className='text-yellow' />;

    case 'failed':
      return <Icon name='thumbs-o-down' className='text-red' />;

    default:
      return <Icon name='circle' className='text-gray' />;
  }
};

const AssignmentTableRow = ({
  showGroup,
  item: { id, status, name, deadline, group, passingTests, totalTests, percent }
}) => (
  <tr>
    <td className='text-center'>
      {getIcon(status)}
    </td>
    <td>
      <Link to=''>{name}</Link>
    </td>
    {showGroup &&
      <td>{group}</td>}
    <td>
      {(new Date(deadline)).toLocaleDateString()}{', '}
      {(new Date(deadline)).toLocaleTimeString()}
    </td>
    <td className='text-center'>
      {passingTests}/{totalTests}
    </td>
    <td className={classNames({
      'text-center': true,
      'text-green': percent === 100,
      'text-bold': percent === 100 })}>
      {percent}&nbsp;%
    </td>
  </tr>
);

AssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool,
  item: PropTypes.shape({
    id: PropTypes.any.isRequired,
    status: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    deadline: PropTypes.number.isRequired,
    group: PropTypes.any.isRequired
  })
};

export default AssignmentTableRow;
