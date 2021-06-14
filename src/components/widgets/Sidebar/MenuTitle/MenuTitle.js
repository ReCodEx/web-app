import React from 'react';
import PropTypes from 'prop-types';

const MenuTitle = ({ title }) => <li className="nav-header nav-item text-uppercase">{title}</li>;

MenuTitle.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
};

export default MenuTitle;
