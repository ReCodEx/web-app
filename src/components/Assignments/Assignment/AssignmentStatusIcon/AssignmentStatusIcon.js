import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';

// @todo: Add a popover tooltip with textual description of the icon

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

    case 'evaluation-failed':
      return <Icon name='exclamation-triangle' className='text-yellow' />;

    default:
      return <Icon name='circle' className='text-gray' />;
  }
};

AssignmentStatusIcon.propTypes = {
  status: PropTypes.string
};

export default AssignmentStatusIcon;
