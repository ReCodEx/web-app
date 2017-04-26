import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuItem from '../../widgets/Sidebar/MenuItem';

import withLinks from '../../../hoc/withLinks';

const Admin = (
  {
    currentUrl,
    links: { ADMIN_INSTANCES_URI }
  }
) => (
  <ul className="sidebar-menu">
    <MenuTitle
      title={
        <FormattedMessage
          id="app.sudebar.menu.admin.title"
          defaultMessage="Administration"
        />
      }
    />
    <MenuItem
      icon="university"
      title={
        <FormattedMessage
          id="app.sidebar.menu.admin.instances"
          defaultMessage="Instances"
        />
      }
      currentPath={currentUrl}
      link={ADMIN_INSTANCES_URI}
    />
  </ul>
);

Admin.propTypes = {
  currentUrl: PropTypes.string.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(Admin);
