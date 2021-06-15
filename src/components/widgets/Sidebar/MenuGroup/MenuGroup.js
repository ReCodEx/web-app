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

import '../Sidebar.css';

class MenuGroup extends Component {
  render() {
    const {
      title,
      icon = 'th',
      items,
      createLink,
      currentPath,
      notifications,
      isActive = false,
      intl: { locale },
    } = this.props;

    const itemsNotificationsCount = item => notifications[item.getIn(['data', 'id'])];
    const notificationsCount = items.reduce((acc, item) => acc + itemsNotificationsCount(item), 0);

    return (
      <li
        className={classnames({
          'nav-item': true,
          'menu-is-opening': isActive,
          'menu-open': isActive,
        })}>
        <a href="#" className="nav-link">
          <Icon icon={icon} gapRight fixedWidth className="nav-icon small" />
          <p className="sidebarMenuItem">
            <Icon icon="angle-left" className="sidebarArrowIcon right" />
            {notificationsCount > 0 && <span className="right badge badge-primary">{notificationsCount}</span>}
            {title}
          </p>
        </a>

        <ul className="nav nav-treeview sidebarDropdown">
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
                icon="users"
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
  createLink: PropTypes.func.isRequired,
  notifications: PropTypes.object,
  isActive: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(MenuGroup);
