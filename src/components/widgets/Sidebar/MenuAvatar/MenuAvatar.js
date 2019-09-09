import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from '../Sidebar.less';
import AvatarContainer from '../../../../containers/AvatarContainer/AvatarContainer';

const MenuAvatar = ({ title, avatarUrl, firstName, notificationsCount = 0, isActive = false, onClick }) => (
  <li
    className={classnames({
      active: isActive,
    })}>
    <a
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
      className={styles.cursorPointer}>
      <AvatarContainer
        avatarUrl={avatarUrl}
        fullName={title}
        firstName={firstName}
        size={20}
        altClassName={styles.avatar}
      />
      <span className={styles.menuItem}>{title}</span>
      {notificationsCount > 0 && <small className="label pull-right bg-yellow">{notificationsCount}</small>}
    </a>
  </li>
);

MenuAvatar.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  avatarUrl: PropTypes.string,
  firstName: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  notificationsCount: PropTypes.number,
  isActive: PropTypes.bool,
};

export default MenuAvatar;
