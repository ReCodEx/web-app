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

  toggleOpen = () => {
    if (this.state.isOpen) {
      this.setState({ isOpen: false, showAll: false });
      this.props.hideAll();
    } else {
      this.setState({ isOpen: true });
    }
  }

  toggleShowAll = () => this.setState({ showAll: !this.state.showAll });

  componentWillReceiveProps = (newProps) => {
    // if there are new notifications, open the panel
  };

  render() {
    const { newNotifications, oldNotifications } = this.props;
    const { isOpen, showAll } = this.state;

    return (
      <HeaderNotificationsDropdown
        isOpen={isOpen}
        toggleOpen={this.toggleOpen}
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
