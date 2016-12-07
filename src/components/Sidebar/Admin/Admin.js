import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import MenuTitle from '../../AdminLTE/Sidebar/MenuTitle';
import MenuItem from '../../AdminLTE/Sidebar/MenuItem';

const Admin = ({
  currentUrl
}, {
  links: { ADMIN_INSTANCES_URI }
}) => (
  <ul className='sidebar-menu'>
    <MenuTitle title={<FormattedMessage id='app.sudebar.menu.admin.title' defaultMessage='Administration' />} />
    <MenuItem
      icon='university'
      title={<FormattedMessage id='app.sidebar.menu.admin.instances' defaultMessage='Instances' />}
      currentPath={currentUrl}
      link={ADMIN_INSTANCES_URI} />
  </ul>
);

Admin.propTypes = {
  currentUrl: PropTypes.string.isRequired
};

Admin.contextTypes = {
  links: PropTypes.object
};

export default Admin;
