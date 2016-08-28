import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Icon from 'react-fontawesome';
import Collapse from 'react-collapse';
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
      isActive = false,
      forceOpen = false
    } = this.props;

    const { open } = this.state;

    const itemsNotificationsCount = item => notifications[item.getIn(['data', 'id'])];
    const notificationsCount = items.reduce((acc, item) => acc + itemsNotificationsCount(item), 0);

    return (
      <li
        className={classNames({
          active: isActive || open,
          treeview: true
        })}>
        <a href='#' onClick={this.toggle}>
          <i className={`fa fa-${icon}`} />
          <span style={{
            whiteSpace: 'normal',
            display: 'inline-block',
            verticalAlign: 'top'
          }}>
            {title}
          </span>
          <span className='pull-right-container pull-right'>
            {notificationsCount > 0 &&
              <small className='label pull-right bg-blue'>{notificationsCount}</small>}
            <Icon name='angle-left' className='pull-right' />
          </span>
        </a>
        {(open || forceOpen) && (
          <ul className='treeview-menu'>
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
        )}
      </li>
    );
  }
}

MenuGroup.propTypes = {
  title: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ]).isRequired,
  icon: PropTypes.string,
  link: PropTypes.string,
  isActive: PropTypes.bool,
  forceOpen: PropTypes.bool
};

export default MenuGroup;
