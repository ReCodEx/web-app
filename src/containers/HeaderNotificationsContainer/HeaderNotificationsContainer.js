import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import HeaderNotificationsDropdown from '../../components/widgets/HeaderNotificationsDropdown';
import { hideNotification } from '../../redux/modules/notifications';
import { newNotificationsSelector, oldNotificationsSelector } from '../../redux/selectors/notifications';

class HeaderNotificationsContainer extends Component {
  state = { showAll: false };

  // Monitor clicking and hide the notifications panel when the user clicks sideways
  componentDidMount = () => {
    if (canUseDOM) {
      window.addEventListener('mousedown', this.close);
    }
  };

  componentWillUnmount = () => {
    if (canUseDOM) {
      window.removeEventListener('mousedown', this.close);
    }
  };

  toggleShowAll = e => {
    e.preventDefault();
    this.setState({ showAll: !this.state.showAll });
  };

  render() {
    const { newNotifications, oldNotifications, hideNotification } = this.props;
    const { showAll } = this.state;

    return (
      <HeaderNotificationsDropdown
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

export default connect(mapStateToProps, mapDispatchToProps)(HeaderNotificationsContainer);
