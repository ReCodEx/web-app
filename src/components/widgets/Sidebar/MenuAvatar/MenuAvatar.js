import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './MenuAvatar.less';

const MenuAvatar = ({
  title,
  avatarUrl,
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
      <img src={avatarUrl} alt={title} className={styles.avatar} />
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

MenuAvatar.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  avatarUrl: PropTypes.string,
  onClick: PropTypes.func,
  notificationsCount: PropTypes.number,
  isActive: PropTypes.bool
};

export default MenuAvatar;
