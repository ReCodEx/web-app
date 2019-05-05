import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import classnames from 'classnames';
import { Label, Alert } from 'react-bootstrap';

import Icon from '../../icons';
import Markdown from '../Markdown';
import { getLocalizedText } from '../../../helpers/localizedData';

import styles from './HeaderSystemMessagesDropdown.less';

const HeaderSystemMessagesDropdown = ({ isOpen, toggleOpen, markClick, systemMessages, intl: { locale } }) => (
  <li
    className={classnames({
      'notifications-menu': true,
      dropdown: true,
      open: isOpen,
    })}>
    <a href="#" className="dropdown-toggle" onClick={toggleOpen}>
      <Icon icon={['far', 'envelope']} />
      {systemMessages.length > 0 && <Label bsStyle="warning">{systemMessages.length}</Label>}
    </a>
    <ul className={classnames(['dropdown-menu', styles.dropdownMenu])} onClick={markClick}>
      <li className="header">
        <FormattedMessage
          id="app.systemMessages.title"
          defaultMessage="You have {count, number} active {count, plural, one {message} two {messages} other {messages}}"
          values={{ count: systemMessages.length }}
        />
      </li>
      <li>
        <ul className={classnames(['menu', styles.messageList])}>
          {systemMessages.map((message, idx) => (
            <Alert key={idx} bsStyle={message.type} className={styles.messageAlert}>
              <Markdown source={getLocalizedText(message, locale)} />
            </Alert>
          ))}
        </ul>
      </li>
    </ul>
  </li>
);

HeaderSystemMessagesDropdown.propTypes = {
  isOpen: PropTypes.bool,
  showAll: PropTypes.bool,
  toggleOpen: PropTypes.func.isRequired,
  markClick: PropTypes.func.isRequired,
  systemMessages: PropTypes.array.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(HeaderSystemMessagesDropdown);
