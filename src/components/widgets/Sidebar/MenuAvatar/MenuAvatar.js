import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './MenuAvatar.less';
import Avatar, { FakeAvatar } from '../../Avatar';

const MenuAvatar = ({
  title,
  avatarUrl,
  notificationsCount = 0,
  isActive = false,
  useGravatar = false,
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
      {useGravatar && avatarUrl !== null
        ? <Avatar
            size={20}
            src={avatarUrl}
            title={title}
            className={styles.avatar}
          />
        : <FakeAvatar size={20} className={styles.avatar}>
            {title[0]}
          </FakeAvatar>}
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
  isActive: PropTypes.bool,
  useGravatar: PropTypes.bool
};

export default MenuAvatar;
