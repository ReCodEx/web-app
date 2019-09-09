import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import Icon from '../../../icons';
import styles from '../Sidebar.less';

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
      active: link === pathname + search,
      small,
    })}>
    <Link to={link} target={inNewTab ? '_blank' : undefined}>
      <Icon icon={icon} fixedWidth gapRight />
      <span className={styles.menuItem}>{title}</span>
      {notificationsCount > 0 && <small className="label pull-right bg-yellow">{notificationsCount}</small>}
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
