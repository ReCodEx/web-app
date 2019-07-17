import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from 'react-router';

import Icon from '../../../icons';
import { UrlContext } from '../../../../helpers/contexts';

const MenuItem = ({
  title,
  icon = 'circle',
  link,
  currentPath,
  notificationsCount = 0,
  inNewTab = false,
  small = false,
  onIsActive = isActive => isActive,
}) => (
  <UrlContext.Consumer>
    {({ isActive }) => (
      <li
        className={classnames({
          active: isActive(link),
          small,
        })}>
        <Link to={link} target={inNewTab ? '_blank' : undefined}>
          <Icon icon={icon} fixedWidth gapRight />
          <span
            style={{
              whiteSpace: 'normal',
              display: 'inline-block',
              verticalAlign: 'top',
            }}>
            {title}
          </span>
          {notificationsCount > 0 && <small className="label pull-right bg-yellow">{notificationsCount}</small>}
        </Link>
      </li>
    )}
  </UrlContext.Consumer>
);

MenuItem.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  currentPath: PropTypes.string,
  notificationsCount: PropTypes.number,
  link: PropTypes.string,
  inNewTab: PropTypes.bool,
  small: PropTypes.bool,
  onIsActive: PropTypes.func,
};

export default MenuItem;
