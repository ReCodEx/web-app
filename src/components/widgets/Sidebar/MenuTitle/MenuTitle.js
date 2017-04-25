import React, { PropTypes } from 'react';

const MenuTitle = ({
  title
}) => (
  <li className="header text-uppercase">
    {title}
  </li>
);

MenuTitle.propTypes = {
  title: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ]).isRequired
};

export default MenuTitle;
