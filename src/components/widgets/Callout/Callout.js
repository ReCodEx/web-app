import React from 'react';
import PropTypes from 'prop-types';
import Icon, { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from '../../icons';

const DEFAULT_ICONS = {
  info: <InfoIcon />,
  warning: <WarningIcon />,
  danger: <ErrorIcon />,
  success: <SuccessIcon />,
};

// Adapter for callouts (with touch of our own) from AdminLTE 3
const Callout = ({ children, className = '', variant = 'info', icon = null }) => {
  if (typeof icon === 'string') {
    icon = <Icon icon={icon} />;
  } else if (icon === null) {
    icon = DEFAULT_ICONS[variant] || DEFAULT_ICONS.info;
  }

  return (
    <div className={`${className} callout callout-${variant}`}>
      <span className="callout-icon text-white">{icon}</span>
      {children}
    </div>
  );
};

Callout.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.string,
  children: PropTypes.any,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

export default Callout;
