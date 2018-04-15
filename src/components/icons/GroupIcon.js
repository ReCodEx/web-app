import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const GroupIcon = ({ organizational = false, ...props }) =>
  <FontAwesomeIcon {...props} icon={organizational ? 'sitemap' : 'users'} />;

GroupIcon.propTypes = {
  organizational: PropTypes.bool
};

export default GroupIcon;
