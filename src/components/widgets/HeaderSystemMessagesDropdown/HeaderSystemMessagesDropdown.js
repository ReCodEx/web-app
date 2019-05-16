import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { Label, Table } from 'react-bootstrap';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import Icon, { TypedMessageIcon } from '../../icons';
import Markdown from '../Markdown';
import { getLocalizedText } from '../../../helpers/localizedData';

import styles from './HeaderSystemMessagesDropdown.less';
import DateTime from '../DateTime';

const preventClickPropagation = ev => ev.stopPropagation();

const HeaderSystemMessagesDropdown = ({ isOpen, toggleOpen, systemMessages, locale }) => (
  <li
    className={classnames({
      'notifications-menu': true,
      dropdown: true,
      open: isOpen,
    })}
    onMouseDown={isOpen ? preventClickPropagation : undefined}>
    <a href="#" className="dropdown-toggle" onClick={toggleOpen}>
      <Icon icon={['far', 'envelope']} />
      {systemMessages.length > 0 && <Label bsStyle="warning">{systemMessages.length}</Label>}
    </a>
    <ul className={classnames(['dropdown-menu', styles.dropdownMenu])}>
      <li className="header">
        <small>
          <FormattedMessage
            id="app.systemMessages.title"
            defaultMessage="You have {count, number} active {count, plural, one {message} two {messages} other {messages}}"
            values={{ count: systemMessages.length }}
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
  locale: PropTypes.string.isRequired,
};

export default HeaderSystemMessagesDropdown;
