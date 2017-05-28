import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router';

const MenuItem = (
  {
    title,
    icon = 'circle-o',
    link,
    currentPath,
    notificationsCount = 0,
    inNewTab = false,
    onIsActive = isActive => isActive
  },
  { isActive }
) => (
  <li
    className={classNames({
      active: isActive(link)
    })}
  >
    <Link to={link} target={inNewTab ? '_blank' : undefined}>
      <i
        className={classNames({
          fa: true,
          [`fa-${icon}`]: true,
          'text-yellow': notificationsCount > 0
        })}
      />
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
  </li>
);

MenuItem.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  icon: PropTypes.string,
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
