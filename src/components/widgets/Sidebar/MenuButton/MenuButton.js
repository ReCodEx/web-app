import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const MenuButton = ({
  title,
  icon = 'circle-o',
  notificationsCount = 0,
  isActive = false,
  onClick
}) =>
  <li
    className={classNames({
      active: isActive
    })}
  >
    <a
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
      style={{ cursor: 'pointer' }}
    >
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
    </a>
  </li>;

MenuButton.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  icon: PropTypes.string,
  onClick: PropTypes.func,
  notificationsCount: PropTypes.number,
  isActive: PropTypes.bool
};

export default MenuButton;
