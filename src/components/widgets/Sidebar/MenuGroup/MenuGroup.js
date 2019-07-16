import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl } from 'react-intl';
import classnames from 'classnames';

import MenuItem from '../MenuItem';
import LoadingMenuItem from '../LoadingMenuItem';
import { isLoading } from '../../../../redux/helpers/resourceManager';
import { getLocalizedName } from '../../../../helpers/localizedData';
import Icon from '../../../icons';

class MenuGroup extends Component {
  state = {
    open: null,
    defaultOpen: null,
  };

  static getDerivedStateFromProps = ({ isActive = false }, state) =>
    state.defaultOpen !== isActive // props have changed -> reinitialize
      ? {
          open: isActive, // this is actual state value indicating expanded/collapsed menu
          defaultOpen: isActive, // this is only derived from props, so we can detect props change and reinitialize state
        }
      : null;

  toggle = e => {
    e.preventDefault();
    this.setState({
      open: !this.state.open,
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
      forceOpen = false,
      intl: { locale },
    } = this.props;

    const dropdownStyles = {
      overflowY: 'auto',
      overflowX: 'hidden',
    };

    const itemsNotificationsCount = item => notifications[item.getIn(['data', 'id'])];
    const notificationsCount = items.reduce((acc, item) => acc + itemsNotificationsCount(item), 0);

    return (
      <li
        className={classnames({
          active: open || forceOpen,
          treeview: true,
        })}>
        <a href="#" onClick={this.toggle}>
          <Icon icon={icon} gapRight fixedWidth />
          <span
            style={{
              whiteSpace: 'normal',
              display: 'inline-block',
              verticalAlign: 'top',
            }}>
            {title}
          </span>
          <span className="pull-right-container">
            {notificationsCount > 0 && <small className="label pull-right bg-blue">{notificationsCount}</small>}
            <Icon icon="angle-left" className="pull-right" style={{ height: '15px' }} />
          </span>
        </a>
        <ul className="treeview-menu" style={dropdownStyles}>
          {items.map((item, key) =>
            isLoading(item) ? (
              <LoadingMenuItem key={key} />
            ) : (
              <MenuItem
                key={key}
                title={getLocalizedName(
                  {
                    name: item.getIn(['data', 'name']),
                    localizedTexts: item.getIn(['data', 'localizedTexts']).toJS(),
                  },
                  locale
                )}
                icon={['far', 'circle']}
                currentPath={currentPath}
                notificationsCount={itemsNotificationsCount(item)}
                link={createLink(item)}
                small={true}
              />
            )
          )}
        </ul>
      </li>
    );
  }
}

MenuGroup.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  link: PropTypes.string,
  items: ImmutablePropTypes.list,
  currentPath: PropTypes.string,
  forceOpen: PropTypes.bool,
  createLink: PropTypes.func.isRequired,
  notifications: PropTypes.object,
  isActive: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(MenuGroup);
