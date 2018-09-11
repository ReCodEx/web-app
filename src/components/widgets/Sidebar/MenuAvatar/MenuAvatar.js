import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './MenuAvatar.less';
import Avatar, { FakeAvatar } from '../../Avatar';

const MenuAvatar = ({
  title,
  avatarUrl,
  firstName,
  notificationsCount = 0,
  isActive = false,
  useGravatar = false,
  onClick
}) =>
  <li
    className={classnames({
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
            altClassName={styles.avatar}
          />
        : <FakeAvatar size={20} altClassName={styles.avatar}>
            {firstName[0]}
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
  firstName: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  notificationsCount: PropTypes.number,
  isActive: PropTypes.bool,
  useGravatar: PropTypes.bool
};

export default MenuAvatar;
