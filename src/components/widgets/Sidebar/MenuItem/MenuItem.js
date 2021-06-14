import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import Icon from '../../../icons';
import '../Sidebar.css';

const MenuItem = ({
  title,
  icon = 'circle',
  link,
  currentPath,
  notificationsCount = 0,
  inNewTab = false,
  small = false,
  onIsActive = isActive => isActive,
  location: { pathname, search },
}) => (
  <li
    className={classnames({
      'nav-item': true,
      active: link === pathname + search,
      small: true,
    })}>
    <Link to={link} target={inNewTab ? '_blank' : undefined} className="nav-link">
      <Icon icon={icon} fixedWidth gapRight className="nav-icon" />
      <p className="sidebarMenuItem">{title}</p>
      {notificationsCount > 0 && <span className="right badge badge-warning">{notificationsCount}</span>}
    </Link>
  </li>
);

MenuItem.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
  }).isRequired,
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  currentPath: PropTypes.string,
  notificationsCount: PropTypes.number,
  link: PropTypes.string,
  inNewTab: PropTypes.bool,
  small: PropTypes.bool,
  onIsActive: PropTypes.func,
};

export default withRouter(MenuItem);
