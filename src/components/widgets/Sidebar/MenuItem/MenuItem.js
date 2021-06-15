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
  notificationsCount = 0,
  inNewTab = false,
  small = false,
  location: { pathname, search },
}) => (
  <li className={classnames({ 'nav-item': true, small })}>
    <Link
      to={link}
      target={inNewTab ? '_blank' : undefined}
      className={classnames({ 'nav-link': true, active: link === pathname + search })}>
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
  notificationsCount: PropTypes.number,
  link: PropTypes.string,
  inNewTab: PropTypes.bool,
  small: PropTypes.bool,
};

export default withRouter(MenuItem);
