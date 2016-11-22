import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import Icon from 'react-fontawesome';
import classNames from 'classnames';

const InfoBox = ({
  title,
  value,
  icon = 'info',
  spin = false,
  progress,
  description = '',
  color = 'green'
}) => (
  <div className={classNames({
    'info-box': true,
    [`bg-${color}`]: true
  })}>
    <span className='info-box-icon'>
      <Icon name={icon} spin={spin} />
    </span>
    <div className='info-box-content'>
      <span className='info-box-text'>{title}</span>
      <span className='info-box-number'>{value}</span>
      <div className='progress'>
        <div className='progress-bar' style={{ width: `${progress * 100}%` }}></div>
      </div>
      <span className='progress-description'>
        {description}
      </span>
    </div>
  </div>
);

InfoBox.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedNumber]) }),
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]),
  icon: PropTypes.string,
  spin: PropTypes.bool,
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]),
  progress: PropTypes.number,
  color: PropTypes.string
};

export default InfoBox;
