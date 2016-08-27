import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { defineMessage } from 'react-intl';
import { List } from 'immutable';
import HeaderNotificationsDropdown from '../../components/AdminLTE/HeaderNotificationsDropdown';
import { hideAll } from '../../redux/modules/notifications';
import { newNotificationsSelector, oldNotificationsSelector } from '../../redux/selectors/notifications';

class HeaderNotificationsContainer extends Component {

  state = { isOpen: false, showAll: false };

  //
  // Monitor clicking and hide the notifications panel when the user clicks sideways

  componentWillMount = () => {
    this.lastClick = 0;
    // events only in the browser
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => this.clickAnywhere());
    }
  };

  componentWillUnMount = () => {
    // events only in the browser
    if (typeof window !== 'undefined') {
      window.removeEventListener(() => this.clickAnywhere());
    }
  };

  clickAnywhere = () => {
    if (this.state.isOpen && Date.now() - this.lastClick > 10) { // 10ms tolerance
      this.close();
    }
  };

  markClick = () => {
    this.lastClick = Date.now();
  };

  //
  //

  toggleOpen = () => {
    this.state.isOpen ? this.close() : this.open();
    this.markClick();
  }
  toggleShowAll = () => this.setState({ showAll: !this.state.showAll });

  close = () => {
    this.setState({ isOpen: false, showAll: false });
    this.props.hideAll();
  };
  open = () => this.setState({ isOpen: true });

  componentWillReceiveProps = (newProps) => {
    if (this.props.newNotifications.size < newProps.newNotifications.size) {
      this.setState({ isOpen: true }); // force open the notifications dropdown - there are some new notifications
    }
  };

  render() {
    const { newNotifications, oldNotifications } = this.props;
    const { isOpen, showAll } = this.state;

    return (
      <HeaderNotificationsDropdown
        isOpen={isOpen}
        toggleOpen={this.toggleOpen}
        markClick={this.markClick}
        showAll={showAll}
        toggleShowAll={this.toggleShowAll}
        oldNotifications={oldNotifications}
        newNotifications={newNotifications} />
    );
  }

}

HeaderNotificationsContainer.propTypes = {
  newNotifications: ImmutablePropTypes.list.isRequired,
  oldNotifications: ImmutablePropTypes.list.isRequired,
  hideAll: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  newNotifications: newNotificationsSelector(state),
  oldNotifications: oldNotificationsSelector(state)
});

const mapDispatchToProps = { hideAll };

export default connect(mapStateToProps, mapDispatchToProps)(HeaderNotificationsContainer);
