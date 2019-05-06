import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import SortableTable, { SortableTableColumnDescriptor } from '../../widgets/SortableTable';
import { getLocalizedText } from '../../../helpers/localizedData';
import DateTime from '../../widgets/DateTime';
import { roleLabels } from '../../helpers/usersRoles';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import FilterSystemMessagesForm from '../../forms/FilterSystemMessagesForm/FilterSystemMessagesForm';

import styles from './MessagesList.less';

const getVisibleMessages = (systemMessages, showAll) =>
  showAll ? systemMessages : systemMessages.filter(msg => msg.visibleTo * 1000 >= Date.now());

class MessagesList extends Component {
  state = { showAll: false, visibleMessages: [] };

  componentDidMount() {
    this.setState({
      visibleMessages: getVisibleMessages(this.props.systemMessages, this.state.showAll),
    });
  }

  prepareColumnDescriptors = defaultMemoize(locale => {
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
        }
      ),

      new SortableTableColumnDescriptor(
        'visibleTo',
        <FormattedMessage id="app.systemMessagesList.visibleTo" defaultMessage="Visible To" />,
        {
          comparator: ({ visibleTo: t1 }, { visibleTo: t2 }) => t2 - t1,
          cellRenderer: visibleTo => visibleTo && <DateTime unixts={visibleTo} />,
        }
      ),

      new SortableTableColumnDescriptor('authorId', <FormattedMessage id="generic.author" defaultMessage="Author" />, {
        cellRenderer: authorId => authorId && <UsersNameContainer userId={authorId} />,
      }),

      new SortableTableColumnDescriptor(
        'role',
        <FormattedMessage id="app.systemMessagesList.role" defaultMessage="Role" />,
        {
          comparator: ({ role: r1 }, { role: r2 }) => r1.localeCompare(r2, locale),
          cellRenderer: role => role && roleLabels[role],
        }
      ),

      new SortableTableColumnDescriptor(
        'type',
        <FormattedMessage id="app.systemMessagesList.type" defaultMessage="Type" />,
        {
          comparator: ({ type: t1 }, { type: t2 }) => t1.localeCompare(t2, locale),
          cellRenderer: type => type && <Alert bsStyle={type} className={styles.alertType} />,
        }
      ),

      new SortableTableColumnDescriptor('buttons', '', {
        className: 'text-right',
      }),
    ];

    return columns;
  });

  prepareData = defaultMemoize(systemMessages => {
    const { renderActions } = this.props;

    return systemMessages.map(message => {
      const data = {
        text: { localizedTexts: message.localizedTexts },
        visibleFrom: message.visibleFrom,
        visibleTo: message.visibleTo,
        authorId: message.authorId,
        role: message.role,
        type: message.type,
        buttons: renderActions && renderActions(message),
      };
      return data;
    });
  });

  render() {
    const {
      systemMessages,
      intl: { locale },
    } = this.props;

    return (
      <React.Fragment>
        <FilterSystemMessagesForm
          onSubmit={({ showAll }) => {
            this.setState({
              showAll: showAll,
              visibleMessages: getVisibleMessages(systemMessages, showAll),
            });
            return Promise.resolve();
          }}
          initialValues={{ showAll: this.state.showAll }}
        />
        <SortableTable
          hover
          columns={this.prepareColumnDescriptors(locale)}
          defaultOrder="visibleTo"
          data={this.prepareData(this.state.visibleMessages)}
          empty={
            <div className="text-center text-muted">
              <FormattedMessage
                id="app.systemMessagesList.noMessages"
                defaultMessage="There are currently no system messages."
              />
            </div>
          }
        />
      </React.Fragment>
    );
  }
}

MessagesList.propTypes = {
  systemMessages: PropTypes.array.isRequired,
  intl: intlShape.isRequired,
  renderActions: PropTypes.func,
};

export default injectIntl(MessagesList);
