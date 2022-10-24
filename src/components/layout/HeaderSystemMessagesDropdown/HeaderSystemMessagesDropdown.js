import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table, Dropdown } from 'react-bootstrap';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import { MailIcon, TypedMessageIcon } from '../../icons';
import Markdown from '../../widgets/Markdown';
import DateTime from '../../widgets/DateTime';
import { getLocalizedText } from '../../../helpers/localizedData';

import styles from '../Header/Header.less';

const preventClickPropagation = ev => ev.stopPropagation();

const HeaderSystemMessagesDropdown = ({
  systemMessages,
  totalMessagesCount,
  locale,
  acceptActiveMessages,
  unacceptActiveMessages,
}) => (
  <Dropdown as="li" alignRight navbar className="nav-item">
    <Dropdown.Toggle as="a" id="dropdown-header-system-messages" bsPrefix="nav-link">
      <MailIcon />
      {systemMessages.length > 0 && (
        <span className={`${styles.iconBadgeWrapper} badge-pill badge-warning`}>{systemMessages.length}</span>
      )}
    </Dropdown.Toggle>

    <Dropdown.Menu rootCloseEvent="mousedown" className={styles.dropdownMenuWide} onMouseDown={preventClickPropagation}>
      <Dropdown.Header>
        <FormattedMessage
          id="app.systemMessages.titleLong"
          defaultMessage="You have {totalMessagesCount, number} active {totalMessagesCount, plural, one {message} two {messages} other {messages}} ({unreadCount, number} unread {unreadCount, plural, one {message} two {messages} other {messages}})"
          values={{
            totalMessagesCount,
            unreadCount: systemMessages.length,
          }}
        />
      </Dropdown.Header>

      <Dropdown.Divider className="mb-0" />

      <div className={styles.messageList}>
        <Table responsive hover className="no-margin">
          <tbody>
            {systemMessages.map((message, idx) => (
              <tr key={idx}>
                <td className={`text-${message.type} bg-${message.type} shrink-col valign-middle text-center`}>
                  <TypedMessageIcon type={message.type} size="lg" />
                </td>
                <td>
                  <Markdown source={getLocalizedText(message, locale)} />
                  <small className="text-muted text-nowrap float-right">
                    <UsersNameContainer userId={message.authorId} isSimple />
                    &nbsp;
                    <DateTime
                      unixts={message.visibleFrom}
                      showDate={false}
                      showTime={false}
                      showRelative={true}
                      showOverlay={true}
                    />
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {(systemMessages.length > 0 || totalMessagesCount > 0) && (
        <>
          <Dropdown.Divider className="mt-0" />
          <div className="text-center small p-1">
            {systemMessages.length > 0 && (
              <a href="#" onClick={acceptActiveMessages}>
                <FormattedMessage
                  id="app.systemMessages.acceptActiveMessages"
                  defaultMessage="Hide messages (mark them as read)"
                />
              </a>
            )}

            {systemMessages.length === 0 && totalMessagesCount > 0 && (
              <a href="#" onClick={unacceptActiveMessages}>
                <FormattedMessage
                  id="app.systemMessages.unacceptActiveMessages"
                  defaultMessage="Show all messages (mark them as unread)"
                />
              </a>
            )}
          </div>
        </>
      )}
    </Dropdown.Menu>
  </Dropdown>
);

HeaderSystemMessagesDropdown.propTypes = {
  showAll: PropTypes.bool,
  systemMessages: PropTypes.array.isRequired,
  totalMessagesCount: PropTypes.number.isRequired,
  locale: PropTypes.string.isRequired,
  acceptActiveMessages: PropTypes.func,
  unacceptActiveMessages: PropTypes.func,
};

export default HeaderSystemMessagesDropdown;
