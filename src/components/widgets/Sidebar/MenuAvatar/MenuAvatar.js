import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from '../Sidebar.less';
import AvatarContainer from '../../../../containers/AvatarContainer/AvatarContainer';
import Icon from '../../../icons';

const MenuAvatar = ({
  title,
  avatarUrl,
  firstName,
  notificationsCount = 0,
  isActive = false,
  onClick,
  onRemove = null,
}) => (
  <li
    className={classnames({
      active: isActive,
    })}>
    <a
      onClick={ev => {
        ev.preventDefault();
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

      {onRemove && (
        <span className="pull-right">
          <Icon
            icon="user-slash"
            className="text-danger"
            timid
            gapRight
            onClick={ev => {
              ev.preventDefault();
              onRemove();
            }}
          />
        </span>
      )}
    </a>
  </li>
);

MenuAvatar.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  avatarUrl: PropTypes.string,
  firstName: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  notificationsCount: PropTypes.number,
  isActive: PropTypes.bool,
};

export default MenuAvatar;
