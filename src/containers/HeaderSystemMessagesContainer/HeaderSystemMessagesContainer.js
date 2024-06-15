import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { lruMemoize } from 'reselect';

import HeaderSystemMessagesDropdown from '../../components/layout/HeaderSystemMessagesDropdown';
import { readyActiveSystemMessagesSelector, fetchManyUserStatus } from '../../redux/selectors/systemMessages';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { updateUIData } from '../../redux/modules/users';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import { safeGet } from '../../helpers/common';

const getVisibleSystemMessages = lruMemoize((systemMessages, user) => {
  const systemMessagesAccepted = safeGet(user, ['privateData', 'uiData', 'systemMessagesAccepted']);
  return systemMessagesAccepted ? systemMessages.filter(m => m.visibleFrom > systemMessagesAccepted) : systemMessages;
});

class HeaderSystemMessagesContainer extends Component {
  updateUiDataSystemMessagesAccepted = systemMessagesAccepted => {
    const { loggedInUser, updateUIData } = this.props;
    if (isReady(loggedInUser)) {
      const user = getJsData(loggedInUser);
      const uiData = safeGet(user, ['privateData', 'uiData'], {});
      updateUIData(user.id, { ...uiData, systemMessagesAccepted });
    }
  };

  acceptActiveMessages = ev => {
    ev && ev.preventDefault();
    const { systemMessages } = this.props;
    const lastMessageFrom = systemMessages.reduce((lastFrom, { visibleFrom }) => Math.max(lastFrom, visibleFrom), 0);
    this.updateUiDataSystemMessagesAccepted(lastMessageFrom || Math.floor(Date.now() / 1000));
  };

  unacceptActiveMessages = ev => {
    ev && ev.preventDefault();
    this.updateUiDataSystemMessagesAccepted(null);
  };

  render() {
    const { systemMessages, fetchStatus, loggedInUser, locale } = this.props;

    return (
      <ResourceRenderer resource={loggedInUser} hiddenUntilReady>
        {user => (
          <FetchManyResourceRenderer fetchManyStatus={fetchStatus} loading={<span />}>
            {() => (
              <HeaderSystemMessagesDropdown
                systemMessages={getVisibleSystemMessages(systemMessages, user)}
                totalMessagesCount={systemMessages.length}
                locale={locale}
                acceptActiveMessages={this.acceptActiveMessages}
                unacceptActiveMessages={this.unacceptActiveMessages}
              />
            )}
          </FetchManyResourceRenderer>
        )}
      </ResourceRenderer>
    );
  }
}

HeaderSystemMessagesContainer.propTypes = {
  systemMessages: PropTypes.array.isRequired,
  fetchStatus: PropTypes.string,
  loggedInUser: ImmutablePropTypes.map,
  updateUIData: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
};

export default connect(
  state => ({
    fetchStatus: fetchManyUserStatus(state),
    systemMessages: readyActiveSystemMessagesSelector(state),
    loggedInUser: loggedInUserSelector(state),
  }),
  dispatch => ({
    updateUIData: (userId, uiData) => dispatch(updateUIData(userId, uiData)),
  })
)(HeaderSystemMessagesContainer);
