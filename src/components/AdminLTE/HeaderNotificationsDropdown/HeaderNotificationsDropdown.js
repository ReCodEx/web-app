import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Label } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import HeaderNotification from '../HeaderNotification';

const HeaderNotificationsDropdown = ({
  isOpen,
  showAll,
  toggleOpen,
  toggleShowAll,
  markClick,
  newNotifications,
  oldNotifications
}) => (
  <li className={classNames({
    'notifications-menu': true,
    'dropdown': true,
    'open': isOpen
  })}>
    <a href='#' className='dropdown-toggle' onClick={toggleOpen}>
      <Icon name='bell-o' />
      {newNotifications.size > 0 && <Label bsStyle='primary'>{newNotifications.size}</Label>}
    </a>
    <ul className='dropdown-menu' onClick={markClick}>
      <li className='header'>
        <FormattedMessage
          id='app.notifications.title'
          defaultMessage={`You have {count, number} new {count, plural,
            one {notification}
            other {notifications}
          }`}
          values={{ count: newNotifications.size }} />
      </li>
      <li>
        <ul className='menu'>
          {newNotifications.map(notification =>
            <HeaderNotification key={notification.id} {...notification} />)}
          {showAll && oldNotifications.map(notification =>
            <HeaderNotification key={notification.id} {...notification} />)}
        </ul>
      </li>
      {oldNotifications.size > 0 && (
        <li className='footer'>
          <a href='#' onClick={toggleShowAll}>
            {showAll
              ? <FormattedMessage id='app.notifications.hideAll' defaultMessage='Only new notifications' />
              : <FormattedMessage
                  id='app.notifications.showAll'
                  defaultMessage={`Show {count, plural,
                    one {old notification}
                    two {two notifications}
                    other {all # notifications}
                  }`}
                  values={{ count: newNotifications.size + oldNotifications.size }} />}
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
  markClick: PropTypes.func.isRequired,
  newNotifications: ImmutablePropTypes.list,
  oldNotifications: ImmutablePropTypes.list
};

export default HeaderNotificationsDropdown;
