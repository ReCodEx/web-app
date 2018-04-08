import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-fontawesome';

const GroupIcon = ({ organizational = false, ...props }) =>
  <Icon {...props} name={organizational ? 'sitemap' : 'users'} />;

GroupIcon.propTypes = {
  organizational: PropTypes.bool
};

export default GroupIcon;
