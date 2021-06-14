import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { Badge } from 'react-bootstrap';

import Icon from '../../icons';
import HeaderNotification from '../HeaderNotification';

import styles from './headerNotificationDropdown.less';

const preventClickPropagation = ev => ev.stopPropagation();

const HeaderNotificationsDropdown = ({
  isOpen,
  showAll,
  toggleOpen,
  toggleShowAll,
  hideNotification,
  newNotifications,
  oldNotifications,
}) => (
  <li
    className={classnames({
      'nav-item': true,
      dropdown: true,
      open: isOpen,
    })}
    onMouseDown={isOpen ? preventClickPropagation : undefined}>
    <a href="#" className="nav-link" data-toggle="dropdown" onClick={toggleOpen}>
      {newNotifications.size === 0 ? (
        <Icon icon={['far', 'bell']} />
      ) : (
        <Icon icon={['fas', 'bell']} className="faa-shake animated" />
      )}
      {newNotifications.size > 0 && (
        <Badge variant="danger">{newNotifications.reduce((acc, n) => acc + n.count, 0)}</Badge>
      )}
    </a>
    <ul className={classnames(['dropdown-menu', styles.dropdownMenu])}>
      <li className="nav-header">
        <FormattedMessage
          id="app.notifications.title"
          defaultMessage="You have {count, number} new {count, plural, one {notification} two {notifications} other {notifications}}"
          values={{ count: newNotifications.size }}
        />
      </li>
      <li>
        <ul className="menu">
          {newNotifications.map(notification => (
            <HeaderNotification key={notification.id} hide={hideNotification} {...notification} isNew={true} />
          ))}
          {showAll &&
            oldNotifications.map(notification => <HeaderNotification key={notification.id} {...notification} />)}
        </ul>
      </li>
      {oldNotifications.size > 0 && (
        <li className="footer">
          <a href="#" onClick={toggleShowAll}>
            {showAll ? (
              <FormattedMessage id="app.notifications.hideAll" defaultMessage="Only new notifications" />
            ) : (
              <FormattedMessage
                id="app.notifications.showAll"
                defaultMessage="Show {count, plural, one {old notification} two {two old notifications} other {all # notifications}}"
                values={{
                  count: newNotifications.size + oldNotifications.size,
                }}
              />
            )}
          </a>
        </li>
      )}
    </ul>
  </li>
);

HeaderNotificationsDropdown.propTypes = {
  isOpen: PropTypes.bool,
  showAll: PropTypes.bool,
  toggleOpen: PropTypes.func.isRequired,
  toggleShowAll: PropTypes.func.isRequired,
  hideNotification: PropTypes.func.isRequired,
  newNotifications: ImmutablePropTypes.list,
  oldNotifications: ImmutablePropTypes.list,
};

export default HeaderNotificationsDropdown;
