import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { connect } from 'react-redux';
import HeaderSystemMessagesDropdown from '../../components/widgets/HeaderSystemMessagesDropdown';
import { readyActiveSystemMessagesSelector, fetchManyUserStatus } from '../../redux/selectors/systemMessages';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { fetchAllUserMessages } from '../../redux/modules/systemMessages';

class HeaderSystemMessagesContainer extends Component {
  state = { isOpen: false };

  static loadAsync = (params, dispatch) => Promise.all([dispatch(fetchAllUserMessages)]);

  //
  // Monitor clicking and hide the notifications panel when the user clicks sideways

  componentWillMount = () => {
    this.props.loadAsync();
    this.lastClick = 0;
    if (canUseDOM) {
      window.addEventListener('click', () => this.clickAnywhere());
    }
  };

  componentWillUnMount = () => {
    if (canUseDOM) {
      window.removeEventListener(() => this.clickAnywhere());
    }
  };

  clickAnywhere = () => {
    if (this.state.isOpen === true && this.isClickingSomewhereElse()) {
      this.close();
    }
  };

  markClick = () => {
    this.lastClick = Date.now();
  };

  /**
   * Determines, whether this click is on the container or not - a 50ms tolerance
   * between now and the time of last click on the container is defined.
   */
  isClickingSomewhereElse = () => Date.now() - this.lastClick > 50;

  toggleOpen = e => {
    e.preventDefault();
    this.state.isOpen ? this.close() : this.open();
    this.markClick();
  };

  close = () => {
    this.setState({ isOpen: false });
  };

  open = () => this.setState({ isOpen: true });

  render() {
    const { systemMessages, fetchStatus } = this.props;
    const { isOpen } = this.state;

    return (
      <FetchManyResourceRenderer fetchManyStatus={fetchStatus} loading={<span />}>
        {() => (
          <HeaderSystemMessagesDropdown
            isOpen={isOpen}
            toggleOpen={this.toggleOpen}
            markClick={this.markClick}
            systemMessages={systemMessages}
          />
        )}
      </FetchManyResourceRenderer>
    );
  }
}

HeaderSystemMessagesContainer.propTypes = {
  systemMessages: PropTypes.array.isRequired,
  fetchStatus: PropTypes.string,
  loadAsync: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    fetchStatus: fetchManyUserStatus(state),
    systemMessages: readyActiveSystemMessagesSelector(state),
  }),
  dispatch => ({
    loadAsync: () => HeaderSystemMessagesContainer.loadAsync({}, dispatch),
  })
)(HeaderSystemMessagesContainer);
