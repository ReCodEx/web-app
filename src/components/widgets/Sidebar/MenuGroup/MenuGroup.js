import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import Icon from 'react-fontawesome';
import MenuItem from '../MenuItem';
import LoadingMenuItem from '../LoadingMenuItem';
import { isLoading } from '../../../../redux/helpers/resourceManager';

class MenuGroup extends Component {
  componentWillMount = () =>
    this.setState({
      open: this.isActive(this.props)
    });

  componentWillReceiveProps = newProps => {
    if (this.isActive(this.props) !== this.isActive(newProps)) {
      this.setState({
        open: this.isActive(newProps)
      });
    }
  };

  toggle = e => {
    e.preventDefault();
    this.setState({
      open: !this.state.open
    });
  };

  isActive = props => {
    const { isActive } = this.context;
    const { items, createLink } = props;
    return items.find(item => isActive(createLink(item)));
  };

  render() {
    const { open } = this.state;
    const {
      title,
      icon = 'th',
      items,
      createLink,
      currentPath,
      notifications,
      forceOpen = false
    } = this.props;

    const dropdownStyles = {
      maxHeight: 200,
      overflowY: 'auto',
      overflowX: 'hidden'
    };

    const itemsNotificationsCount = item =>
      notifications[item.getIn(['data', 'id'])];
    const notificationsCount = items.reduce(
      (acc, item) => acc + itemsNotificationsCount(item),
      0
    );

    return (
      <li
        className={classNames({
          active: open || forceOpen,
          treeview: true
        })}
      >
        <a href="#" onClick={this.toggle}>
          <i className={`fa fa-${icon}`} />
          <span
            style={{
              whiteSpace: 'normal',
              display: 'inline-block',
              verticalAlign: 'top'
            }}
          >
            {title}
          </span>
          <span className="pull-right-container pull-right">
            {notificationsCount > 0 &&
              <small className="label pull-right bg-blue">
                {notificationsCount}
              </small>}
            <Icon name="angle-left" className="pull-right" />
          </span>
        </a>
        <ul className="treeview-menu" style={dropdownStyles}>
          {items.map(
            (item, key) =>
              isLoading(item)
                ? <LoadingMenuItem key={key} />
                : <MenuItem
                    key={key}
                    title={item.getIn(['data', 'name'])}
                    icon="circle-o"
                    currentPath={currentPath}
                    notificationsCount={itemsNotificationsCount(item)}
                    link={createLink(item)}
                  />
          )}
        </ul>
      </li>
    );
  }
}

MenuGroup.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  icon: PropTypes.string,
  link: PropTypes.string,
  items: ImmutablePropTypes.list,
  currentPath: PropTypes.string,
  forceOpen: PropTypes.bool,
  createLink: PropTypes.func.isRequired,
  notifications: PropTypes.object
};

MenuGroup.contextTypes = {
  isActive: PropTypes.func
};

export default MenuGroup;
