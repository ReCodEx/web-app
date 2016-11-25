import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import MenuTitle from '../../AdminLTE/Sidebar/MenuTitle';
import MenuGroup from '../../AdminLTE/Sidebar/MenuGroup';
import MenuItem from '../../AdminLTE/Sidebar/MenuItem';
import { getId } from '../../../redux/helpers/resourceManager';

const Supervisor = ({
  currentUrl,
  supervisorOf,
  isCollapsed,
  notifications
}, {
  links: { GROUP_URI_FACTORY, EXERCISES_URI_FACTORY }
}) => (
  <ul className='sidebar-menu'>
    <MenuTitle title={<FormattedMessage id='app.sudebar.menu.supervisor.title' defaultMessage='Supervisor' />} />
    <MenuGroup
      title={<FormattedMessage id='app.sidebar.menu.supervisorOf' defaultMessage='Groups - supervisor' />}
      items={supervisorOf.toList()}
      notifications={{}}
      icon='wrench'
      currentPath={currentUrl}
      createLink={item => GROUP_URI_FACTORY(getId(item))}
      forceOpen={isCollapsed} />
    <MenuItem
      title={<FormattedMessage id='app.sidebar.menu.exercises' defaultMessage='Exercises' />}
      icon='puzzle-piece'
      currentPath={currentUrl}
      link={EXERCISES_URI_FACTORY()} />
  </ul>
);

Supervisor.propTypes = {
  currentUrl: PropTypes.string.isRequired,
  supervisorOf: ImmutablePropTypes.map,
  isCollapsed: PropTypes.bool,
  notifications: PropTypes.object
};

Supervisor.contextTypes = {
  links: PropTypes.object
};

export default Supervisor;
