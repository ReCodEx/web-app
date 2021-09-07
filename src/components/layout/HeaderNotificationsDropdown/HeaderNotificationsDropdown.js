import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Badge, Dropdown } from 'react-bootstrap';

import Icon from '../../icons';
import HeaderNotification from '../HeaderNotification';

import styles from '../Header/Header.less';

const preventClickPropagation = ev => ev.stopPropagation();

const HeaderNotificationsDropdown = ({
  showAll,
  toggleShowAll,
  hideNotification,
  newNotifications,
  oldNotifications,
}) => (
  <Dropdown as="li" alignRight navbar className="nav-item">
    <Dropdown.Toggle as="a" id="dropdown-header-notifications" bsPrefix="nav-link">
      {newNotifications.size === 0 ? (
        <Icon icon={['far', 'bell']} />
      ) : (
        <Icon icon={['fas', 'bell']} className="faa-shake animated" />
      )}
      {newNotifications.size > 0 && (
        <span className={styles.iconBadgeWrapper}>
          <Badge variant="warning" pill>
            {newNotifications.reduce((acc, n) => acc + n.count, 0)}
          </Badge>
        </span>
      )}
    </Dropdown.Toggle>

    <Dropdown.Menu rootCloseEvent="mousedown" className={styles.dropdownMenu} onMouseDown={preventClickPropagation}>
      <Dropdown.Header>
        <FormattedMessage
          id="app.notifications.title"
          defaultMessage="You have {count, number} new {count, plural, one {notification} two {notifications} other {notifications}}"
          values={{ count: newNotifications.size }}
        />
      </Dropdown.Header>

      <Dropdown.Divider className="mb-0" />

      {newNotifications.map(notification => (
        <HeaderNotification key={notification.id} hide={hideNotification} {...notification} isNew={true} />
      ))}
      {showAll && oldNotifications.map(notification => <HeaderNotification key={notification.id} {...notification} />)}

      {oldNotifications.size > 0 && (
        <>
          <Dropdown.Divider className="mt-0" />
          <div className="text-center small p-1">
            <a href="#" onClick={toggleShowAll}>
              {showAll ? (
                <FormattedMessage id="app.notifications.hideAll" defaultMessage="Only new notifications" />
              ) : (
                <FormattedMessage
                  id="app.notifications.showAll"
                  defaultMessage="Show {count, plural, one {old notification} two {two old notifications} other {all # notifications}}"
                  values={{
                    count: oldNotifications.size,
                  }}
                />
              )}
            </a>
          </div>
        </>
      )}
    </Dropdown.Menu>
  </Dropdown>
);

HeaderNotificationsDropdown.propTypes = {
  showAll: PropTypes.bool,
  toggleShowAll: PropTypes.func.isRequired,
  hideNotification: PropTypes.func.isRequired,
  newNotifications: ImmutablePropTypes.list,
  oldNotifications: ImmutablePropTypes.list,
};

export default HeaderNotificationsDropdown;
