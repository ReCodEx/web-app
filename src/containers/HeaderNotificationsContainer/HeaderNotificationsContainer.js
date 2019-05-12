import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import HeaderNotificationsDropdown from '../../components/widgets/HeaderNotificationsDropdown';
import { hideNotification } from '../../redux/modules/notifications';
import { newNotificationsSelector, oldNotificationsSelector } from '../../redux/selectors/notifications';

class HeaderNotificationsContainer extends Component {
  state = { isOpen: false, showAll: false };

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

  toggleShowAll = e => {
    e.preventDefault();
    this.setState({ showAll: !this.state.showAll });
  };

  close = () => {
    this.setState({ isOpen: false, showAll: false });
  };

  open = () => this.setState({ isOpen: true });

  componentWillReceiveProps = newProps => {
    const oldVisible = this.props.newNotifications.reduce((acc, notification) => acc + notification.count, 0);
    const newVisible = newProps.newNotifications.reduce((acc, notification) => acc + notification.count, 0);
    if (oldVisible !== newVisible) {
      this.setState({ isOpen: true }); // force open the notifications dropdown - there are some new notifications
    }
  };

  render() {
    const { newNotifications, oldNotifications, hideNotification } = this.props;
    const { isOpen, showAll } = this.state;

    return (
      <HeaderNotificationsDropdown
        isOpen={isOpen}
        toggleOpen={this.toggleOpen}
        showAll={showAll}
        toggleShowAll={this.toggleShowAll}
        hideNotification={hideNotification}
        oldNotifications={oldNotifications}
        newNotifications={newNotifications}
      />
    );
  }
}

HeaderNotificationsContainer.propTypes = {
  newNotifications: ImmutablePropTypes.list.isRequired,
  oldNotifications: ImmutablePropTypes.list.isRequired,
  hideNotification: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  newNotifications: newNotificationsSelector(state),
  oldNotifications: oldNotificationsSelector(state),
});

const mapDispatchToProps = { hideNotification };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderNotificationsContainer);
