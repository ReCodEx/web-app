import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';

const SimpleInfoBox = ({
  title,
  description = '',
  icon = 'info',
  color = 'yellow'
}) => (
  <div className='info-box'>
    <span className={'info-box-icon bg-' + color}>
      <Icon name={icon} />
    </span>
    <div className='info-box-content'>
      <span className='info-box-text'>{title}</span>
      <span className='info-box-number'>{description}</span>
    </div>
  </div>
);

SimpleInfoBox.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.string
};

export default SimpleInfoBox;
