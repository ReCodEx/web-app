import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import MenuItem from '../MenuItem';
import LoadingMenuItem from '../LoadingMenuItem';
import { isLoading } from '../../../../redux/helpers/resourceManager';

class MenuGroup extends Component {
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
      notifications,
      isActive = false
    } = this.props;

    const itemsNotificationsCount = item => notifications[item.getIn(['data', 'id'])];
    const notificationsCount = items.reduce((acc, item) => acc + itemsNotificationsCount(item), 0);

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
            isLoading(item)
              ? <LoadingMenuItem key={key} />
              : <MenuItem
                  key={key}
                  title={item.getIn(['data', 'name'])}
                  icon='circle-o'
                  notificationsCount={itemsNotificationsCount(item)}
                  link={createLink(item)} />
          )}
        </ul>
      </li>
    );
  }
}

MenuGroup.propTypes = {
  title: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ]).isRequired,
  icon: PropTypes.string,
  link: PropTypes.string,
  isActive: PropTypes.bool
};

export default MenuGroup;
