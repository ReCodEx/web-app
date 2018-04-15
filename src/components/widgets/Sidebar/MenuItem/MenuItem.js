import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const MenuItem = (
  {
    title,
    icon = 'circle',
    link,
    currentPath,
    notificationsCount = 0,
    inNewTab = false,
    onIsActive = isActive => isActive
  },
  { isActive }
) =>
  <li
    className={classNames({
      active: isActive(link)
    })}
  >
    <Link to={link} target={inNewTab ? '_blank' : undefined}>
      <FontAwesomeIcon icon={icon} fixedWidth />
      &nbsp;&nbsp;
      <span
        style={{
          whiteSpace: 'normal',
          display: 'inline-block',
          verticalAlign: 'top'
        }}
      >
        {title}
      </span>
      {notificationsCount > 0 &&
        <small className="label pull-right bg-yellow">
          {notificationsCount}
        </small>}
    </Link>
  </li>;

MenuItem.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  currentPath: PropTypes.string,
  notificationsCount: PropTypes.number,
  link: PropTypes.string,
  inNewTab: PropTypes.bool,
  onIsActive: PropTypes.func
};

MenuItem.contextTypes = {
  isActive: PropTypes.func
};

export default MenuItem;
