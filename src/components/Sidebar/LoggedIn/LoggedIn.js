import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Map } from 'immutable';

import { isReady, getJsData, getId } from '../../../redux/helpers/resourceManager';
import MenuTitle from '../../AdminLTE/Sidebar/MenuTitle';
import MenuItem from '../../AdminLTE/Sidebar/MenuItem';
import MenuGroup from '../../AdminLTE/Sidebar/MenuGroup';

const LoggedIn = ({
  instances,
  studentOf,
  supervisorOf,
  notifications,
  isCollapsed,
  currentUrl
}, {
  links: {
    HOME_URI,
    DASHBOARD_URI,
    GROUP_URI_FACTORY,
    BUGS_URL,
    INSTANCE_URI_FACTORY
  }
}) => (
  <ul className='sidebar-menu'>
    <MenuTitle title={<FormattedMessage id='app.sidebar.menu.title' defaultMessage='Menu' />} />
    <MenuItem
      title={<FormattedMessage id='app.sidebar.menu.dashboard' defaultMessage='Dashboard' />}
      icon='dashboard'
      currentPath={currentUrl}
      link={DASHBOARD_URI} />

    {instances && instances.size > 0 &&
      instances
        .toArray()
        .filter(isReady)
        .map(getJsData)
        .map(
          ({ id, name }) => (
            <MenuItem
              key={id}
              title={name}
              icon='university'
              currentPath={currentUrl}
              link={INSTANCE_URI_FACTORY(id)} />
          )
        )}

    {studentOf && studentOf.size > 0 && (
      <MenuGroup
        title={<FormattedMessage id='app.sidebar.menu.studentOf' defaultMessage='Groups - student' />}
        items={studentOf.toList()}
        notifications={notifications}
        icon='puzzle-piece'
        currentPath={currentUrl}
        createLink={item => GROUP_URI_FACTORY(getId(item))}
        forceOpen={isCollapsed} />
    )}
    {supervisorOf && supervisorOf.size > 0 && (
      <MenuGroup
        title={<FormattedMessage id='app.sidebar.menu.supervisorOf' defaultMessage='Groups - supervisor' />}
        items={supervisorOf.toList()}
        notifications={0}
        icon='wrench'
        currentPath={currentUrl}
        createLink={item => GROUP_URI_FACTORY(getId(item))}
        forceOpen={isCollapsed} />
    )}
  </ul>
);

LoggedIn.propTypes = {
  supervisorOf: PropTypes.instanceOf(Map),
  studentOf: PropTypes.instanceOf(Map),
  isCollapsed: PropTypes.bool
};

LoggedIn.contextTypes = {
  links: PropTypes.object,
  location: PropTypes.object
};

export default LoggedIn;
