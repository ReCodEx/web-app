import React, { PropTypes, Component } from 'react';
import { canUseDOM } from 'exenv';
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
    if (this.state.isOpen === true &&
      this.isClickingSomewhereElse()) {
      this.close();
    }
  };

  markClick = () => {
    this.lastClick = Date.now();
  };

  /**
   * Determines, whether this click is on the container or not - a 10ms tolerance
   * between now and the time of last click on the container is defined.
   */
  isClickingSomewhereElse = () =>
    Date.now() - this.lastClick > 50;

  //
  //

  toggleOpen = () => {
    this.state.isOpen ? this.close() : this.open();
    this.markClick();
  };

  toggleShowAll = (e) => {
    e.preventDefault();
    this.markClick();
    this.setState({ showAll: !this.state.showAll });
  };

  close = () => {
    this.setState({ isOpen: false, showAll: false });
    this.props.hideAll();
  };

  open = () => this.setState({ isOpen: true });

  componentWillReceiveProps = (newProps) => {
    if (this.props.newNotifications.size === newProps.newNotifications.size - 1) {
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
