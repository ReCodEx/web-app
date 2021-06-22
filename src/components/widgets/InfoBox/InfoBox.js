import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';

import Icon from '../../icons';
import GroupsName from '../../Groups/GroupsName';

const InfoBox = ({ title, value, icon = 'info', spin = false, progress, description = '', color = 'green' }) => (
  <div
    className={classnames({
      'info-box': true,
      [`bg-${color}`]: true,
    })}>
    <span className="info-box-icon">
      <Icon icon={icon} spin={spin} />
    </span>
    <div className="info-box-content">
      <span className="info-box-text">{title}</span>
      <span className="info-box-number">{value}</span>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="progress-description">{description}</span>
    </div>
  </div>
);

InfoBox.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage, GroupsName]) }),
  ]).isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.element]),
  icon: PropTypes.string,
  spin: PropTypes.bool,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  progress: PropTypes.number,
  color: PropTypes.string,
};

export default InfoBox;
