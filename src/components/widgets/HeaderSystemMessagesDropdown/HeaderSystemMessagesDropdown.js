import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { Badge, Table } from 'react-bootstrap';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import Icon, { TypedMessageIcon } from '../../icons';
import Markdown from '../Markdown';
import { getLocalizedText } from '../../../helpers/localizedData';

import styles from './HeaderSystemMessagesDropdown.less';
import DateTime from '../DateTime';

const preventClickPropagation = ev => ev.stopPropagation();

const HeaderSystemMessagesDropdown = ({
  isOpen,
  toggleOpen,
  systemMessages,
  totalMessagesCount,
  locale,
  acceptActiveMessages,
  unacceptActiveMessages,
}) => (
  <li
    className={classnames({
      'nav-item': true,
      dropdown: true,
      open: isOpen,
    })}
    onMouseDown={isOpen ? preventClickPropagation : undefined}>
    <a href="#" className="nav-link" data-toggle="dropdown" onClick={toggleOpen}>
      <Icon icon={['far', 'envelope']} />
      {systemMessages.length > 0 && <Badge variant="warning">{systemMessages.length}</Badge>}
    </a>
    <ul className={classnames(['dropdown-menu', styles.dropdownMenu])}>
      <li className="nav-header">
        <small>
          <FormattedMessage
            id="app.systemMessages.titleLong"
            defaultMessage="You have {totalMessagesCount, number} active {totalMessagesCount, plural, one {message} two {messages} other {messages}} ({unreadCount, number} unread {unreadCount, plural, one {message} two {messages} other {messages}})"
            values={{
              totalMessagesCount,
              unreadCount: systemMessages.length,
            }}
          />
        </small>
      </li>

      <li>
        <ul className={classnames(['menu', styles.messageList])}>
          <li>
            <Table responsive hover className="no-margin">
              <tbody>
                {systemMessages.map((message, idx) => (
                  <tr key={idx}>
                    <td className={`text-${message.type} bg-${message.type} shrink-col valign-middle text-center`}>
                      <TypedMessageIcon type={message.type} size="lg" />
                    </td>
                    <td>
                      <Markdown source={getLocalizedText(message, locale)} />
                      <small className="text-muted text-nowrap pull-right">
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
          </li>

          {systemMessages.length > 0 && (
            <li className="footer text-center clickable" onClick={acceptActiveMessages}>
              <FormattedMessage
                id="app.systemMessages.acceptActiveMessages"
                defaultMessage="Hide messages (mark them as read)"
              />
            </li>
          )}

          {systemMessages.length === 0 && totalMessagesCount > 0 && (
            <li className="footer text-center clickable" onClick={unacceptActiveMessages}>
              <FormattedMessage
                id="app.systemMessages.unacceptActiveMessages"
                defaultMessage="Show all messages (mark them as unread)"
              />
            </li>
          )}
        </ul>
      </li>
    </ul>
  </li>
);

HeaderSystemMessagesDropdown.propTypes = {
  isOpen: PropTypes.bool,
  showAll: PropTypes.bool,
  toggleOpen: PropTypes.func.isRequired,
  systemMessages: PropTypes.array.isRequired,
  totalMessagesCount: PropTypes.number.isRequired,
  locale: PropTypes.string.isRequired,
  acceptActiveMessages: PropTypes.func,
  unacceptActiveMessages: PropTypes.func,
};

export default HeaderSystemMessagesDropdown;
