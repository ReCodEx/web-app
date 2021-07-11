import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

const TheButtonGroup = ({ children, noShadow = false, className = '' }) => {
  const classNames = ['theButtonGroup', noShadow ? '' : 'elevation-2', className];
  return <div className={classNames.filter(c => c).join(' ')}>{children}</div>;
};

TheButtonGroup.propTypes = {
  children: PropTypes.any,
  noShadow: PropTypes.bool,
  className: PropTypes.string,
};

export default TheButtonGroup;
