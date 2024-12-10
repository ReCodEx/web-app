import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuItem from '../../widgets/Sidebar/MenuItem';

import withLinks from '../../../helpers/withLinks.js';

const Admin = ({
  currentUrl,
  links: { ADMIN_INSTANCES_URI, USERS_URI, FAILURES_URI, SERVER_MANAGEMENT_URI, MESSAGES_URI },
}) => (
  <ul className="nav nav-pills sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false">
    <MenuTitle title={<FormattedMessage id="app.sudebar.menu.admin.title" defaultMessage="Administration" />} />
    <MenuItem
      icon="university"
      title={<FormattedMessage id="app.sidebar.menu.admin.instances" defaultMessage="Instances" />}
      currentPath={currentUrl}
      link={ADMIN_INSTANCES_URI}
    />
    <MenuItem
      icon="user-friends"
      title={<FormattedMessage id="app.sidebar.menu.admin.users" defaultMessage="Users" />}
      currentPath={currentUrl}
      link={USERS_URI}
    />
    <MenuItem
      icon="bomb"
      title={<FormattedMessage id="app.sidebar.menu.admin.failures" defaultMessage="Submission Failures" />}
      currentPath={currentUrl}
      link={FAILURES_URI}
    />
    <MenuItem
      icon="envelope"
      title={<FormattedMessage id="app.sidebar.menu.admin.messages" defaultMessage="System Messages" />}
      currentPath={currentUrl}
      link={MESSAGES_URI}
    />
    <MenuItem
      icon="server"
      title={<FormattedMessage id="app.sidebar.menu.admin.server" defaultMessage="Server Management" />}
      currentPath={currentUrl}
      link={SERVER_MANAGEMENT_URI}
    />
  </ul>
);

Admin.propTypes = {
  currentUrl: PropTypes.string.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(Admin);
