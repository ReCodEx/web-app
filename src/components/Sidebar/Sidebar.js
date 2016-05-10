import React, { PropTypes } from 'react';

import Badge from '../Badge/Badge';
import SidebarMenuTitle from '../SidebarMenuTitle/SidebarMenuTitle';
import SidebarMenuItem from '../SidebarMenuItem/SidebarMenuItem';
import SidebarMenuGroup from '../SidebarMenuGroup/SidebarMenuGroup';

const Sidebar = ({
  user,
  groups = [
    { id: 1, name: 'Programování I', abbr: 'P1', color: '#123' },
    { id: 2, name: 'Programování II', abbr: 'P2', color: '#321', notificationsCount: 2 },
    { id: 3, name: 'Jazyk C# a programovani pro .NET', abbr: 'C#', color: '#222' }
  ],
  logout,
  createSelectGroupLink = item => `/group/${item.id}`,
  isActive = link => link === '/'
}) => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      {user &&
        <Badge
          name={user.firstName + ' ' + user.lastName}
          email={user.email}
          logout={logout} />}

      {!user &&
        <ul className='sidebar-menu'>
          <SidebarMenuTitle title={'ReCodEx'} />
          <SidebarMenuItem
            title='Přihlásit se'
            link='/login' />
        </ul>}

      <ul className='sidebar-menu'>
        <SidebarMenuTitle title={'Menu'} />
        <SidebarMenuGroup
          title='Skupiny'
          items={groups}
          isActive={groups.some(item => isActive(createSelectGroupLink(item)))}
          createLink={createSelectGroupLink} />
      </ul>
    </section>
  </aside>
);

Sidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    institution: PropTypes.string
  }),
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      name: PropTypes.string.isRequired,
      abbr: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  )
};

export default Sidebar;
