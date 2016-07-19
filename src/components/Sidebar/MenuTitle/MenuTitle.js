import React, { PropTypes } from 'react';

const MenuTitle = ({
  title
}) => (
  <li className='header'>{title.toUpperCase()}</li>
);

MenuTitle.propTypes = {
  title: PropTypes.string.isRequired
};

export default MenuTitle;
