import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../icons';

const SimpleInfoBox = ({ title, description = '', icon = 'info', color = 'yellow' }) => (
  <div className="info-box">
    <span className={`info-box-icon bg-${color}`}>
      <Icon icon={icon} />
    </span>
    <div className="info-box-content">
      <span className="info-box-text">{title}</span>
      <span className="info-box-number">{description}</span>
    </div>
  </div>
);

SimpleInfoBox.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  color: PropTypes.string,
};

export default SimpleInfoBox;
