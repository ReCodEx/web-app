import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import SortableTable, { SortableTableColumnDescriptor } from '../../widgets/SortableTable';
import { getLocalizedText } from '../../../helpers/localizedData';
import DateTime from '../../widgets/DateTime';
import { roleLabels, rolePriorities } from '../../helpers/usersRoles';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import FilterSystemMessagesForm from '../../forms/FilterSystemMessagesForm/FilterSystemMessagesForm';
import { TypedMessageIcon } from '../../icons';

import * as styles from './MessagesList.less';

const prepareData = lruMemoize((systemMessages, showAll, renderActions) => {
  const filteredMessages = showAll ? systemMessages : systemMessages.filter(msg => msg.visibleTo * 1000 >= Date.now());

  return filteredMessages.map(message => ({
    ...message,
    text: { localizedTexts: message.localizedTexts },
    buttons: renderActions && renderActions(message),
  }));
});

class MessagesList extends Component {
  state = { showAll: false, visibleMessages: [] };

  prepareColumnDescriptors = lruMemoize(locale => {
    const columns = [
      new SortableTableColumnDescriptor(
        'text',
        <FormattedMessage id="app.systemMessagesList.text" defaultMessage="Text" />,
        {
          className: styles.textPreview,
          comparator: ({ text: t1 }, { text: t2 }) =>
            getLocalizedText(t1, locale).localeCompare(getLocalizedText(t2, locale), locale),
          cellRenderer: text => text && <i>{getLocalizedText(text, locale)}</i>,
        }
      ),

      new SortableTableColumnDescriptor(
        'visibleFrom',
        <FormattedMessage id="app.systemMessagesList.visibleFrom" defaultMessage="Visible From" />,
        {
          comparator: ({ visibleFrom: f1 }, { visibleFrom: f2 }) => f2 - f1,
          cellRenderer: visibleFrom => visibleFrom && <DateTime unixts={visibleFrom} />,
          className: 'valign-middle',
        }
      ),

      new SortableTableColumnDescriptor(
        'visibleTo',
        <FormattedMessage id="app.systemMessagesList.visibleTo" defaultMessage="Visible To" />,
        {
          comparator: ({ visibleTo: t1 }, { visibleTo: t2 }) => t2 - t1,
          cellRenderer: visibleTo => visibleTo && <DateTime unixts={visibleTo} />,
          className: 'valign-middle',
        }
      ),

      new SortableTableColumnDescriptor('authorId', <FormattedMessage id="generic.author" defaultMessage="Author" />, {
        cellRenderer: authorId => authorId && <UsersNameContainer userId={authorId} size={8} />,
        className: 'valign-middle',
      }),

      new SortableTableColumnDescriptor('role', <FormattedMessage id="generic.role" defaultMessage="Role" />, {
        comparator: ({ role: r1 }, { role: r2 }) => Number(rolePriorities[r2]) - Number(rolePriorities[r1]),
        cellRenderer: role => role && roleLabels[role],
        className: 'valign-middle',
      }),

      new SortableTableColumnDescriptor(
        'type',
        <FormattedMessage id="app.systemMessagesList.type" defaultMessage="Type" />,
        {
          cellRenderer: type => type && <TypedMessageIcon type={type} className={`text-${type}`} />,
          className: 'text-center valign-middle',
        }
      ),

      new SortableTableColumnDescriptor('buttons', '', {
        className: 'text-right valign-middle',
      }),
    ];

    return columns;
  });

  render() {
    const {
      systemMessages,
      renderActions,
      intl: { locale },
    } = this.props;

    return (
      <>
        <FilterSystemMessagesForm
          onSubmit={({ showAll }) => {
            this.setState({ showAll });
            return Promise.resolve();
          }}
          initialValues={{ showAll: this.state.showAll }}
        />
        <hr className="no-margin" />
        <SortableTable
          hover
          columns={this.prepareColumnDescriptors(locale)}
          defaultOrder="visibleTo"
          data={prepareData(systemMessages, this.state.showAll, renderActions)}
          empty={
            <div className="text-center text-muted">
              <FormattedMessage
                id="app.systemMessagesList.noMessages"
                defaultMessage="There are currently no system messages."
              />
            </div>
          }
        />
      </>
    );
  }
}

MessagesList.propTypes = {
  systemMessages: PropTypes.array.isRequired,
  intl: PropTypes.object.isRequired,
  renderActions: PropTypes.func,
};

export default injectIntl(MessagesList);
