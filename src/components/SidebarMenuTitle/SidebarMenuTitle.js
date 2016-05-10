import React, { PropTypes } from 'react';

const SidebarMenuTitle = ({
  title
}) => (
  <li className='header'>{title.toUpperCase()}</li>
);

SidebarMenuTitle.propTypes = {
  title: PropTypes.string.isRequired
};

export default SidebarMenuTitle;
