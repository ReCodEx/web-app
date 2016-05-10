import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import SidebarMenuItem from '../SidebarMenuItem/SidebarMenuItem';

class SidebarMenuGroup extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      open: props.isActive === true
    };
  }

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    const {
      title,
      icon = 'th',
      items,
      createLink,
      isActive = false
    } = this.props;

    const notificationsCount = items.reduce((acc, item) =>
      acc + (item.notificationsCount > 0 ? 1 : 0), 0);

    return (
      <li
        className={classNames({
          active: isActive,
          treeview: true
        })}>
        <a href='#' onClick={this.toggle}>
          <i className={`fa fa-${icon}`} />
          <span>{title}</span>
          {notificationsCount > 0 &&
            <small className='label pull-right bg-red'>{notificationsCount}</small>}
        </a>
        <ul
          className='treeview-menu'
          style={{ display: this.state.open ? 'block' : 'none' }}>
          {items.map((item, key) =>
            <SidebarMenuItem
              key={key}
              title={item.name}
              icon='circle-o'
              notificationsCount={item.notificationsCount}
              link={createLink(item)} />)}
        </ul>
      </li>
    );
  }
}

SidebarMenuGroup.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  link: PropTypes.string,
  isActive: PropTypes.bool
};

export default SidebarMenuGroup;
