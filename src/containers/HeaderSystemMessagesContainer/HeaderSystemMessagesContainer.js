import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { connect } from 'react-redux';
import HeaderSystemMessagesDropdown from '../../components/widgets/HeaderSystemMessagesDropdown';
import { readyActiveSystemMessagesSelector, fetchManyUserStatus } from '../../redux/selectors/systemMessages';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';

class HeaderSystemMessagesContainer extends Component {
  state = { isOpen: false };

  // Monitor clicking and hide the notifications panel when the user clicks sideways

  componentWillMount = () => {
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

  render() {
    const { systemMessages, fetchStatus } = this.props;
    const { isOpen } = this.state;

    return (
      <FetchManyResourceRenderer fetchManyStatus={fetchStatus} loading={<span />}>
        {() => (
          <HeaderSystemMessagesDropdown isOpen={isOpen} toggleOpen={this.toggleOpen} systemMessages={systemMessages} />
        )}
      </FetchManyResourceRenderer>
    );
  }
}

HeaderSystemMessagesContainer.propTypes = {
  systemMessages: PropTypes.array.isRequired,
  fetchStatus: PropTypes.string,
};

export default connect(state => ({
  fetchStatus: fetchManyUserStatus(state),
  systemMessages: readyActiveSystemMessagesSelector(state),
}))(HeaderSystemMessagesContainer);
