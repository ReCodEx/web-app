import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

const SidebarMenuItem = ({
  title,
  icon = 'circle-o',
  link,
  notificationsCount = 0,
  isActive
}) => (
  <li
    className={classNames({
      active: isActive
    })}>

    <Link
      to={link}>
      <i className={
        classNames({
          'fa': true,
          [`fa-${icon}`]: true,
          'text-yellow': notificationsCount > 0
        })
      } />
      <span style={{
        whiteSpace: 'normal'
      }}>
        {title}
      </span>
      {notificationsCount > 0 &&
        <small className='label pull-right bg-yellow'>{notificationsCount}</small>}
    </Link>
  </li>
);

SidebarMenuItem.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  notificationsCount: PropTypes.number,
  link: PropTypes.string,
  isActive: PropTypes.bool
};

export default SidebarMenuItem;
