import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { canUseDOM } from 'exenv';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';

import HeaderSystemMessagesDropdown from '../../components/widgets/HeaderSystemMessagesDropdown';
import { readyActiveSystemMessagesSelector, fetchManyUserStatus } from '../../redux/selectors/systemMessages';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { updateUiData } from '../../redux/modules/users';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import { safeGet } from '../../helpers/common';

const getVisibleSystemMessages = defaultMemoize((systemMessages, user) => {
  const systemMessagesAccepted = safeGet(user, ['privateData', 'uiData', 'systemMessagesAccepted']);
  return systemMessagesAccepted ? systemMessages.filter(m => m.visibleFrom > systemMessagesAccepted) : systemMessages;
});

class HeaderSystemMessagesContainer extends Component {
  state = { isOpen: false };

  // Monitor clicking and hide the notifications panel when the user clicks sideways

  componentDidMount = () => {
    if (canUseDOM) {
      window.addEventListener('mousedown', this.close);
    }
  };

  componentWillUnMount = () => {
    if (canUseDOM) {
      window.removeEventListener('mousedown', this.close);
    }
  };

  toggleOpen = e => {
    e.preventDefault();
    this.state.isOpen ? this.close() : this.open();
  };

  close = () => {
    this.setState({ isOpen: false });
  };

  open = () => this.setState({ isOpen: true });

  updateUiDataSystemMessagesAccepted = systemMessagesAccepted => {
    const { loggedInUser, updateUiData } = this.props;
    if (isReady(loggedInUser)) {
      const user = getJsData(loggedInUser);
      const uiData = safeGet(user, ['privateData', 'uiData'], {});
      updateUiData(user.id, { ...uiData, systemMessagesAccepted });
    }
  };

  acceptActiveMessages = () => {
    const { systemMessages } = this.props;
    const lastMessageFrom = systemMessages.reduce((lastFrom, { visibleFrom }) => Math.max(lastFrom, visibleFrom), 0);
    this.updateUiDataSystemMessagesAccepted(lastMessageFrom || Math.floor(Date.now() / 1000));
  };

  unacceptActiveMessages = () => this.updateUiDataSystemMessagesAccepted(null);

  render() {
    const { systemMessages, fetchStatus, loggedInUser, locale } = this.props;
    const { isOpen } = this.state;

    return (
      <ResourceRenderer resource={loggedInUser} hiddenUntilReady>
        {user => (
          <FetchManyResourceRenderer fetchManyStatus={fetchStatus} loading={<span />}>
            {() => (
              <HeaderSystemMessagesDropdown
                isOpen={isOpen}
                toggleOpen={this.toggleOpen}
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
  updateUiData: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
};

export default connect(
  state => ({
    fetchStatus: fetchManyUserStatus(state),
    systemMessages: readyActiveSystemMessagesSelector(state),
    loggedInUser: loggedInUserSelector(state),
  }),
  dispatch => ({
    updateUiData: (userId, uiData) => dispatch(updateUiData(userId, uiData)),
  })
)(HeaderSystemMessagesContainer);
