import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';

const AssignmentStatusIcon = ({
  status
}) => {
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

AssignmentStatusIcon.propTypes = {
  status: PropTypes.string
};

export default AssignmentStatusIcon;
